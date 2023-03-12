import {Controller, Get, Version} from "@nestjs/common";
import {ApiOkResponse, ApiProduces, ApiTags} from "@nestjs/swagger";
import HelloService from "./HelloService.js";

@ApiTags("hello")
@ApiProduces("application/json")
@Controller("/")
class HelloController {
	private readonly helloService: HelloService;

	constructor(helloService: HelloService) {
		this.helloService = helloService;
	}
	@ApiOkResponse({
		description: "Hello",
		type: String,
	})
	@Version(["2"])
	@Get("/hello")
	public getHello(): string {
		return this.helloService.getHello();
	}
	@ApiOkResponse({
		description: "Hello",
		type: String,
	})
	@Version(["1"])
	@Get("/hello")
	public getOldHello(): string {
		return this.helloService.getOldHello();
	}
	@ApiOkResponse({
		description: "Custom hello",
		type: String,
	})
	@Version(["1", "2"])
	@Get("custom-hello")
	public getCustomHello(): string {
		return this.helloService.getCustomHello();
	}
}

export default HelloController;
