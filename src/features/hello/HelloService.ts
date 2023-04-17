import {Injectable} from "@nestjs/common";
import AppConfig from "../../app_config/AppConfig.js";

@Injectable()
class HelloService {
	private readonly appConfig: AppConfig;
	constructor(appConfig: AppConfig) {
		this.appConfig = appConfig;
	}
	public getHello(): string {
		return "Hello world!";
	}
	public getOldHello(): string {
		return "Hello werelld!";
	}
	public getCustomHello(): string {
		return this.appConfig.CUSTOM_HELLO;
	}
}

export default HelloService;
