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

					// usemocker
					const response = await app.inject({
						method: "POST",
						url: "/v1/auth/register",
						payload: requestData,
					});
					expect(response.statusCode).toBe(201);
				});
			});
		});
	});
});
