import {Test, TestingModule} from "@nestjs/testing";
import HelloController from "../../../src/features/hello/HelloController.js";
import HelloService from "../../../src/features/hello/HelloService.js";
import {describe, test, expect, beforeEach} from "@jest/globals";
import AppConfig from "../../../src/config/AppConfig.js";

describe("HelloController", () => {
	let helloController: HelloController;
	beforeEach(async () => {
		const helloModule: TestingModule = await Test.createTestingModule({
			imports: [],
			controllers: [HelloController],
			providers: [HelloService],
		})
			.useMocker((token) => {
				if (token === AppConfig) {
					return {
						CUSTOM_HELLO: "Hello mocked world!",
					};
				}
				return undefined;
			})
			.compile();
		helloController = helloModule.get<HelloController>(HelloController);
	});

	describe("custom hello", () => {
		test('should return "Hello mocked world!"', () => {
			expect(helloController.getCustomHello()).toBe("Hello mocked world!");
		});
	});

	describe("old hello", () => {
		test('should return "Hello werelld!"', () => {
			expect(helloController.getOldHello()).toBe("Hello werelld!");
		});
	});

	describe("hello", () => {
		test('should return "Hello world!"', () => {
			expect(helloController.getHello()).toBe("Hello world!");
		});
	});
});
