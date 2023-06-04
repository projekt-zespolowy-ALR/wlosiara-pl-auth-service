import {Test} from "@nestjs/testing";
import {describe, test, expect, beforeEach, afterEach, beforeAll} from "@jest/globals";
import type {NestFastifyApplication} from "@nestjs/platform-fastify";
import * as Testcontainers from "testcontainers";
import AppOrmModule from "../../../src/app_orm/AppOrmModule.js";
import AppConfig from "../../../src/app_config/AppConfig.js";
import {TypedConfigModule} from "nest-typed-config";
import * as Fs from "fs/promises";

import testsConfig from "../../app_config/testsConfig.js";
import generatePostgresqlPassword from "../../utils/generatePostgresqlPassword.js";
import createTestingApp from "../../utils/createTestingApp.js";
import FeaturesModule from "../../../src/features/FeaturesModule.js";
import UsersMicroserviceReference from "../../../src/features/auth/auth_service/UsersMicroserviceReference.js";
import type RegisterUserResponse from "../../../src/features/auth/auth_service/RegisterUserResponse.js";
import UsersMicroserviceReferenceUsernameAlreadyUsedError from "../../../src/features/auth/auth_service/UsersMicroserviceReferenceUsernameAlreadyUsedError.js";
import UsersMicroserviceReferenceInternalError from "../../../src/features/auth/auth_service/UsersMicroserviceReferenceInternalError.js";

describe("Auth", () => {
	let postgresqlContainer: Testcontainers.StartedPostgreSqlContainer;
	let app: NestFastifyApplication;
	let postgresqlInitializationSqlScript: string;

	beforeAll(async () => {
		postgresqlInitializationSqlScript = await Fs.readFile(
			testsConfig.TESTS_POSTGRESQL_INITIALIZATION_SQL_SCRIPT_PATH,
			"utf-8"
		);
	});

	let usersMicroserviceClientMock: UsersMicroserviceReference = {
		async requestUserCreation(username: string): Promise<RegisterUserResponse> {
			throw new UsersMicroserviceReferenceUsernameAlreadyUsedError(username);
		},
	} as UsersMicroserviceReference;

	beforeEach(async () => {
		const postgresqlContainerPassword = generatePostgresqlPassword();

		postgresqlContainer = await new Testcontainers.PostgreSqlContainer(
			testsConfig.TESTS_POSTGRESQL_CONTAINER_IMAGE_NAME
		)
			.withPassword(postgresqlContainerPassword)
			.withEnvironment({"PGPASSWORD": postgresqlContainerPassword})
			.withDatabase(testsConfig.TESTS_POSTGRESQL_CONTAINER_DATABASE_NAME)
			.start();

		await postgresqlContainer.exec([
			"psql",
			`--host=localhost`,
			`--port=5432`,
			`--username=${postgresqlContainer.getUsername()}`,
			`--dbname=${postgresqlContainer.getDatabase()}`,
			`--no-password`,
			`--command`,
			`${postgresqlInitializationSqlScript}`,
		]);

		const AppConfigModule = TypedConfigModule.forRoot({
			schema: AppConfig,
			load: () => ({
				POSTGRES_HOST: postgresqlContainer.getHost(),
				POSTGRES_PORT: postgresqlContainer.getPort(),
				POSTGRES_USERNAME: postgresqlContainer.getUsername(),
				POSTGRES_PASSWORD: postgresqlContainer.getPassword(),
				POSTGRES_DATABASE: postgresqlContainer.getDatabase(),
				USERS_MICROSERVICE_BASE_URL: "http://users-microservice",
				TOKEN_LENGTH: 16,
			}),
		});
		const appModule = await Test.createTestingModule({
			imports: [FeaturesModule, AppOrmModule, AppConfigModule],
		})
			.overrideProvider(UsersMicroserviceReference)
			.useValue(usersMicroserviceClientMock)
			.compile();

		app = await createTestingApp(appModule);
	}, testsConfig.TESTS_INTEGRATION_TEST_BEFORE_EACH_TIMEOUT * 1000);

	afterEach(async () => {
		await Promise.all([postgresqlContainer.stop(), app.close()]);
	});
	describe("v1", () => {
		describe("POST /v1/auth/register", () => {
			describe("when called with valid data", () => {
				test("should return 201 CREATED", async () => {
					const requestData = {
						email: "test.email@example.com",
						username: "test-username",
						password: "test-hashed-password",
					};
					usersMicroserviceClientMock.requestUserCreation =
						async function (): Promise<RegisterUserResponse> {
							return Promise.resolve({
								userId: "f37c6620-db6f-4ff4-8e90-d215219891c9",
								username: "test-username",
							});
						};

					const response = await app.inject({
						method: "POST",
						url: "/v1/auth/register",
						payload: requestData,
					});
					expect(response.statusCode).toBe(201);
				});
			});
			describe("when called with valid data, but email is already registered", () => {
				test("should return 409 CONFLICT", async () => {
					const requestData = {
						email: "test.email@example.com",
						username: "test0test",
						password: "test-hashed-password",
					};
					usersMicroserviceClientMock.requestUserCreation =
						async function (): Promise<RegisterUserResponse> {
							return Promise.resolve({
								userId: "e7c46327-ea2e-49b6-a761-eaa18a5c3de1",
								username: "test0test",
							});
						};

					const response = await app.inject({
						method: "POST",
						url: "/v1/auth/register",
						payload: requestData,
					});

					const request_02_data = {
						email: "test.email@example.com",
						username: "test-username",
						password: "test-hashed-password",
					};

					const response_02 = await app.inject({
						method: "POST",
						url: "/v1/auth/register",
						payload: request_02_data,
					});

					expect(response.statusCode).toBe(201);
					expect(response_02.statusCode).toBe(409);
				});
			});
			describe("when called with valid data, but username is already used", () => {
				test("should return 409 CONFLICT", async () => {
					const requestData = {
						email: "test.email@example.com",
						username: "test",
						password: "test-hashed-password",
					};

					usersMicroserviceClientMock.requestUserCreation =
						async function (): Promise<RegisterUserResponse> {
							return Promise.resolve({
								userId: "e7c46327-ea2e-49b6-a761-eaa18a5c3de1",
								username: "test",
							});
						};

					const response = await app.inject({
						method: "POST",
						url: "/v1/auth/register",
						payload: requestData,
					});

					const request_02_data = {
						email: "test2.email@example.com",
						username: "test",
						password: "test-hashed-password",
					};

					usersMicroserviceClientMock.requestUserCreation =
						async function (): Promise<RegisterUserResponse> {
							throw new UsersMicroserviceReferenceUsernameAlreadyUsedError(
								request_02_data.username
							);
						};

					const response_02 = await app.inject({
						method: "POST",
						url: "/v1/auth/register",
						payload: request_02_data,
					});

					expect(response.statusCode).toBe(201);
					expect(response_02.statusCode).toBe(409);
				});
			});
			describe("when called with invalid data", () => {
				test("email is a number: should return 400 BAD REQUEST", async () => {
					const requestData = {
						email: 123,
						username: "test-username",
						password: "test-hashed-password",
					};

					const response = await app.inject({
						method: "POST",
						url: "/v1/auth/register",
						payload: requestData,
					});

					expect(response.statusCode).toBe(400);
				});
				test("email is not valid: should return 400 BAD REQUEST", async () => {
					const requestData = {
						email: "dddd",
						username: "test-username",
						password: "test-hashed-password",
					};

					const response = await app.inject({
						method: "POST",
						url: "/v1/auth/register",
						payload: requestData,
					});

					expect(response.statusCode).toBe(400);
				});

				test("password is too short: should return 400 BAD REQUEST", async () => {
					const requestData = {
						email: "test@test.com",
						username: "test-username",
						password: "test",
					};

					const response = await app.inject({
						method: "POST",
						url: "/v1/auth/register",
						payload: requestData,
					});

					expect(response.statusCode).toBe(400);
				});

				test("password is too long: should return 400 BAD REQUEST", async () => {
					const requestData = {
						email: "test@test.com",
						username: "test-username",
						password: "test".repeat(100),
					};

					const response = await app.inject({
						method: "POST",
						url: "/v1/auth/register",
						payload: requestData,
					});

					expect(response.statusCode).toBe(400);
				});
			});

			describe("when called with missing data", () => {
				test("should return 400 BAD REQUEST", async () => {
					const requestData = {
						username: "test-username",
						password: "test-hashed-password",
					};

					const response = await app.inject({
						method: "POST",
						url: "/v1/auth/register",
						payload: requestData,
					});

					expect(response.statusCode).toBe(400);
				});
			});

			describe("when users microservice is down", () => {
				test("should return 500 INTERNAL SERVER ERROR", async () => {
					const requestData = {
						email: "email@email.com",
						username: "test-username",
						password: "test-hashed-password",
					};

					usersMicroserviceClientMock.requestUserCreation =
						async function (): Promise<RegisterUserResponse> {
							throw new UsersMicroserviceReferenceInternalError();
						};

					const response = await app.inject({
						method: "POST",
						url: "/v1/auth/register",
						payload: requestData,
					});

					expect(response.statusCode).toBe(500);
				});
			});

			describe("when users microservice throws random error", () => {
				test("should return the error", async () => {
					const requestData = {
						email: "email@email.com",
						username: "test-username",
						password: "test-hashed-password",
					};

					const randomError = new Error("random error");

					usersMicroserviceClientMock.requestUserCreation =
						async function (): Promise<RegisterUserResponse> {
							throw randomError;
						};

					const response = await app.inject({
						method: "POST",
						url: "/v1/auth/register",
						payload: requestData,
					});

					expect(response.statusCode).toBe(500);
				});
			});
		});
		describe("POST /v1/auth/login", () => {
			describe("when called with valid data & user is registered", () => {
				test("should return 201 CREATED", async () => {
					const requestData = {
						email: "test@test.com",
						username: "test-username",
						password: "test-password",
					};

					usersMicroserviceClientMock.requestUserCreation =
						async function (): Promise<RegisterUserResponse> {
							return Promise.resolve({
								userId: "e7c46327-ea2e-49b6-a761-eaa18a5c3de1",
								username: "test-username",
							});
						};
					await app.inject({
						method: "POST",
						url: "/v1/auth/register",
						payload: requestData,
					});

					const loginResponse = await app.inject({
						method: "POST",
						url: "/v1/auth/login",
						payload: {
							email: requestData.email,
							password: requestData.password,
						},
					});
					expect(loginResponse.statusCode).toBe(201);
				});
			});
			describe("when called with valid data & user is not registered", () => {
				test("should return 400 BAD REQUEST", async () => {
					const requestData = {
						email: "test@example.com",
						password: "test-password",
					};

					const loginResponse = await app.inject({
						method: "POST",
						url: "/v1/auth/login",
						payload: {
							...requestData,
						},
					});

					expect(loginResponse.statusCode).toBe(400);
				});
			});
			describe("when user is registered but password is wrong", () => {
				test("should return 400 BAD REQUEST", async () => {
					const requestData = {
						email: "test@test.com",
						username: "test-username",
						password: "test-password",
					};

					usersMicroserviceClientMock.requestUserCreation =
						async function (): Promise<RegisterUserResponse> {
							return Promise.resolve({
								userId: "e7c46327-ea2e-49b6-a761-eaa18a5c3de1",
								username: "test-username",
							});
						};
					await app.inject({
						method: "POST",
						url: "/v1/auth/register",
						payload: requestData,
					});

					const loginResponse = await app.inject({
						method: "POST",
						url: "/v1/auth/login",
						payload: {
							email: requestData.email,
							password: "different-password",
						},
					});
					expect(loginResponse.statusCode).toBe(400);
				});
			});
			describe("when called with invalid data: email is missing", () => {
				test("should return 400 BAD REQUEST", async () => {
					const requestData = {
						password: "test-password",
					};

					const loginResponse = await app.inject({
						method: "POST",
						url: "/v1/auth/login",
						payload: {
							...requestData,
						},
					});

					expect(loginResponse.statusCode).toBe(400);
				});
			});
			describe("when called with invalid data: password is missing", () => {
				test("should return 400 BAD REQUEST", async () => {
					const requestData = {
						email: "test@email.com",
					};

					const loginResponse = await app.inject({
						method: "POST",
						url: "/v1/auth/login",
						payload: {
							...requestData,
						},
					});

					expect(loginResponse.statusCode).toBe(400);
				});
			});
			describe("when called with invalid data: email is not valid", () => {
				test("should return 400 BAD REQUEST", async () => {
					const requestData = {
						email: "test",
						password: "test-password",
					};

					const loginResponse = await app.inject({
						method: "POST",
						url: "/v1/auth/login",
						payload: {
							...requestData,
						},
					});

					expect(loginResponse.statusCode).toBe(400);
				});
			});
		});
		describe("POST /v1/auth/logout", () => {
			describe("when user is logged in", () => {
				test("should return 201 OK", async () => {
					const requestData = {
						email: "email@example.com",
						password: "test-password",
						username: "test-username",
					};

					usersMicroserviceClientMock.requestUserCreation =
						async function (): Promise<RegisterUserResponse> {
							return Promise.resolve({
								userId: "e7c46327-ea2e-49b6-a761-eaa18a5c3de1",
								username: "test-username",
							});
						};

					await app.inject({
						method: "POST",
						url: "/v1/auth/register",
						payload: requestData,
					});

					const loginResponse = await app.inject({
						method: "POST",
						url: "/v1/auth/login",
						payload: {
							email: requestData.email,
							password: requestData.password,
						},
					});

					const token = loginResponse.json().token;

					const logoutResponse = await app.inject({
						method: "POST",
						url: "/v1/auth/logout",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});
					expect(token).not.toBeNull();
					expect(logoutResponse.statusCode).toBe(201);
				});
			});

			describe("when user is not logged in and tries to log out", () => {
				test("should return 401 UNAUTHORIZED", async () => {
					const logoutResponse = await app.inject({
						method: "POST",
						url: "/v1/auth/logout",
					});

					expect(logoutResponse.statusCode).toBe(401);
				});
			});
		});
		describe("POST /v1/auth/me", () => {
			describe("when user is logged in", () => {
				test("should return 200 OK", async () => {
					const requestData = {
						email: "test@mail.com",
						password: "test-password",
						username: "test-username",
					};

					usersMicroserviceClientMock.requestUserCreation =
						async function (): Promise<RegisterUserResponse> {
							return Promise.resolve({
								userId: "e7c46327-ea2e-49b6-a761-eaa18a5c3de1",
								username: "test-username",
							});
						};

					await app.inject({
						method: "POST",
						url: "/v1/auth/register",
						payload: requestData,
					});

					const loginResponse = await app.inject({
						method: "POST",
						url: "/v1/auth/login",
						payload: {
							email: requestData.email,
							password: requestData.password,
						},
					});

					const token = loginResponse.json().token;

					const meResponse = await app.inject({
						method: "GET",
						url: "/v1/auth/me",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});

					expect(token).not.toBeNull();
					console.log(meResponse.json());
					expect(meResponse.statusCode).toBe(200);
				});
			});

			describe("when user is not logged in and tries to get their data", () => {
				test("should return 401 UNAUTHORIZED", async () => {
					const meResponse = await app.inject({
						method: "GET",
						url: "/v1/auth/me",
					});

					expect(meResponse.statusCode).toBe(401);
				});
			});
		});
	});
});
