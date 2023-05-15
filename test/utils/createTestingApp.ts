import type {TestingModule} from "@nestjs/testing";
import {FastifyAdapter, type NestFastifyApplication} from "@nestjs/platform-fastify";
import initializeApp from "../../src/initializeApp.js";

export default async function createTestingApp(
	appTestingModule: TestingModule
): Promise<NestFastifyApplication> {
	const testingApp = appTestingModule.createNestApplication<NestFastifyApplication>(
		new FastifyAdapter()
	);
	initializeApp(testingApp);
	await testingApp.init();
	await testingApp.getHttpAdapter().getInstance().ready();
	return testingApp;
}
