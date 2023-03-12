import {Test} from "@nestjs/testing";
import {VersioningType} from "@nestjs/common";
import {describe, test, expect, beforeEach, afterEach, beforeAll} from "@jest/globals";
import {FastifyAdapter, NestFastifyApplication} from "@nestjs/platform-fastify";
import CatsModule from "../../../src/features/cats/CatsModule.js";
import * as Testcontainers from "testcontainers";
import AppOrmModule from "../../../src/orm/AppOrmModule.js";
import AppConfig from "../../../src/config/AppConfig.js";
import {TypedConfigModule} from "nest-typed-config";
import * as fs from "fs/promises";

import testsConfig from "../../config/testsConfig.js";
import generatePostgresqlPassword from "../../utils/generatePostgresqlPassword.js";

let postgresqlContainer: Testcontainers.StartedPostgreSqlContainer | null = null;
let app: NestFastifyApplication | null = null;
let postgresqlInitializationSqlScript: string | null = null;

beforeAll(async () => {
	postgresqlInitializationSqlScript = await fs.readFile(
		testsConfig.TESTS_POSTGRESQL_INITIALIZATION_SQL_SCRIPT_PATH,
		"utf-8"
	);
});

beforeEach(async () => {
	if (!postgresqlInitializationSqlScript) {
		throw new Error("Database initialization SQL is not initialized");
	}
	const postgresqlContainerPassword = generatePostgresqlPassword();

	const postgresqlContainer = await new Testcontainers.PostgreSqlContainer(
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
		load: () => {
			if (!postgresqlContainer) {
				throw new Error("PostgreSQL container is not initialized");
			}
			return {
				POSTGRES_HOST: postgresqlContainer.getHost(),
				POSTGRES_PORT: postgresqlContainer.getPort(),
				POSTGRES_USERNAME: postgresqlContainer.getUsername(),
				POSTGRES_PASSWORD: postgresqlContainer.getPassword(),
				POSTGRES_DATABASE: postgresqlContainer.getDatabase(),
			};
		},
	});
	const appModule = await Test.createTestingModule({
		imports: [CatsModule, AppOrmModule, AppConfigModule],
	}).compile();

	app = appModule.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
	app.enableVersioning({
		type: VersioningType.URI,
	});
	await app.init();
	await app.getHttpAdapter().getInstance().ready();
}, testsConfig.TESTS_INTEGRATION_TEST_BEFORE_EACH_TIMEOUT * 1000);

afterEach(async () => {
	if (postgresqlContainer) {
		await postgresqlContainer.stop();
	}
	if (app) {
		await app.close();
	}
});

describe("HelloModule", () => {
	describe("v2", () => {
		describe("Empty database", () => {
			test("GET /cats", async () => {
				if (!app) {
					throw new Error("App is not initialized");
				}
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
				if (!app) {
					throw new Error("App is not initialized");
				}
				const response = await app.inject({
					method: "GET",
					url: "/v2/cats/1",
				});
				expect(response.statusCode).toBe(404);
			});
			test("POST /cats", async () => {
				if (!app) {
					throw new Error("App is not initialized");
				}
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
				if (!app) {
					throw new Error("App is not initialized");
				}
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
