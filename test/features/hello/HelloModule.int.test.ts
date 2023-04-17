import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({path: path.join(__dirname, ".env.test")});
import {Test} from "@nestjs/testing";
import {describe, test, expect, beforeEach, afterEach} from "@jest/globals";
import HelloModule from "../../../src/features/hello/HelloModule.js";
import type {NestFastifyApplication} from "@nestjs/platform-fastify";
import AppConfigModule from "../../../src/app_config/AppConfigModule.js";

import createTestingApp from "../../utils/createTestingApp.js";

describe("HelloModule", () => {
	let app: NestFastifyApplication;
	beforeEach(async () => {
		const appModule = await Test.createTestingModule({
			imports: [HelloModule, AppConfigModule],
		}).compile();

		app = await createTestingApp(appModule);
	});
	afterEach(async () => {
		await app.close();
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
