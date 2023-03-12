import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({path: path.join(__dirname, ".env.test")});
import {Test} from "@nestjs/testing";
import {VersioningType} from "@nestjs/common";
import {describe, test, expect, beforeEach} from "@jest/globals";
import HelloModule from "../../../src/features/hello/HelloModule.js";
import {FastifyAdapter, NestFastifyApplication} from "@nestjs/platform-fastify";
import AppConfigModule from "../../../src/config/AppConfigModule.js";

describe("HelloModule", () => {
	let app: NestFastifyApplication;
	beforeEach(async () => {
		const appModule = await Test.createTestingModule({
			imports: [HelloModule, AppConfigModule],
		}).compile();

		app = appModule.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
		app.enableVersioning({
			type: VersioningType.URI,
		});
		await app.init();
		await app.getHttpAdapter().getInstance().ready();
	});
	describe("v1", () => {
		test("GET /hello", async () => {
			const response = await app.inject({
				method: "GET",
				url: "/v1/hello",
			});
			expect(response.statusCode).toBe(200);
			expect(response.payload).toBe("Hello werelld!");
		});
	});
	describe("v2", () => {
		test("GET /custom-hello", async () => {
			const response = await app.inject({
				method: "GET",
				url: "/v2/custom-hello",
			});
			expect(response.statusCode).toBe(200);
			expect(response.payload).toBe("Hello .env world!");
		});
		test("GET /hello", async () => {
			const response = await app.inject({
				method: "GET",
				url: "/v2/hello",
			});
			expect(response.statusCode).toBe(200);
			expect(response.payload).toBe("Hello world!");
		});
	});
});
