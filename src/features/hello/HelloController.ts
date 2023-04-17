import {Controller, Get, Version} from "@nestjs/common";

import HelloService from "./HelloService.js";

@Controller("/")
class HelloController {
	private readonly helloService: HelloService;

	constructor(helloService: HelloService) {
		this.helloService = helloService;
	}

	@Version(["2"])
	@Get("/hello")
	public getHello(): string {
		return this.helloService.getHello();
	}

	@Version(["1"])
	@Get("/hello")
	public getOldHello(): string {
		return this.helloService.getOldHello();
	}

	@Get("custom-hello")
	public getCustomHello(): string {
		return this.helloService.getCustomHello();
	}
}

export default HelloController;
