import {Test} from "@nestjs/testing";
import {describe, test, expect, beforeEach, afterEach, beforeAll} from "@jest/globals";
import type {NestFastifyApplication} from "@nestjs/platform-fastify";
import CatsModule from "../../../src/features/cats/CatsModule.js";
import * as Testcontainers from "testcontainers";
import AppOrmModule from "../../../src/orm/AppOrmModule.js";
import AppConfig from "../../../src/app_config/AppConfig.js";
import {TypedConfigModule} from "nest-typed-config";
import * as fs from "fs/promises";

import testsConfig from "../../app_config/testsConfig.js";
import generatePostgresqlPassword from "../../utils/generatePostgresqlPassword.js";
import createTestingApp from "../../utils/createTestingApp.js";

describe("HelloModule", () => {
	let postgresqlContainer: Testcontainers.StartedPostgreSqlContainer;
	let app: NestFastifyApplication;
	let postgresqlInitializationSqlScript: string;

	beforeAll(async () => {
		postgresqlInitializationSqlScript = await fs.readFile(
			testsConfig.TESTS_POSTGRESQL_INITIALIZATION_SQL_SCRIPT_PATH,
			"utf-8"
		);
	});

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
			}),
		});
		const appModule = await Test.createTestingModule({
			imports: [CatsModule, AppOrmModule, AppConfigModule],
		}).compile();

		app = await createTestingApp(appModule);
	}, testsConfig.TESTS_INTEGRATION_TEST_BEFORE_EACH_TIMEOUT * 1000);

	afterEach(async () => {
		await Promise.all([postgresqlContainer.stop(), app.close()]);
	});
	describe("v1", () => {
		describe("Empty database", () => {
			test("GET /cats", async () => {
				const response = await app.inject({
					method: "GET",
					url: "/v1/cats",
				});
				expect(response.statusCode).toBe(200);
				expect(response.json()).toEqual({
					data: [],
					meta: {skip: 0, take: 10, totalItemsCount: 0, pageItemsCount: 0},
				});
			});
			test("GET /cats/:id", async () => {
				const response = await app.inject({
					method: "GET",
					url: "/v1/cats/1",
				});
				expect(response.statusCode).toBe(404);
			});
			test("POST /cats", async () => {
				const addCatRequestBody = {
					name: "test2",
					age: 1,
					breed: "test",
				} as const;
				const response = await app.inject({
					method: "POST",
					url: "/v1/cats",
					payload: addCatRequestBody,
				});
				expect(response.statusCode).toBe(201);
			});
		});
	});
	describe("v2", () => {
		describe("Empty database", () => {
			test("GET /cats", async () => {
				const response = await app.inject({
					method: "GET",
					url: "/v2/cats",
				});
				expect(response.statusCode).toBe(200);
				expect(response.json()).toEqual({
					data: [],
					meta: {skip: 0, take: 10, totalItemsCount: 0, pageItemsCount: 0},
				});
			});
			test("GET /cats/:id", async () => {
				const response = await app.inject({
					method: "GET",
					url: "/v2/cats/1",
				});
				expect(response.statusCode).toBe(404);
			});
			test("POST /cats", async () => {
				const addCatRequestBody = {
					name: "test2",
					age: 1,
					breed: "test",
				} as const;
				const response = await app.inject({
					method: "POST",
					url: "/v2/cats",
					payload: addCatRequestBody,
				});
				expect(response.statusCode).toBe(201);
			});
		});
		describe("Database with one cat", () => {
			test("GET /cats", async () => {
				const addCatRequestBody = {
					name: "test2",
					age: 1,
					breed: "test",
				} as const;
				await app.inject({
					method: "POST",
					url: "/v2/cats",
					payload: addCatRequestBody,
				});
				const response = await app.inject({
					method: "GET",
					url: "/v2/cats",
				});
				expect(response.statusCode).toBe(200);
				const responseJson = response.json();
				expect(responseJson).toHaveProperty("data");
				expect(responseJson).toHaveProperty("meta");
				expect(responseJson.meta).toEqual({
					skip: 0,
					take: 10,
					totalItemsCount: 1,
					pageItemsCount: 1,
				});
				expect(responseJson.data).toHaveLength(1);
				expect(responseJson.data[0]).toHaveProperty("id");
				expect(typeof responseJson.data[0].id).toBe("string");
				expect(responseJson.data[0].id).not.toHaveLength(0);
				expect((({id, ...rest}) => rest)(responseJson.data[0])).toEqual(addCatRequestBody);
			});
		});
	});
});
