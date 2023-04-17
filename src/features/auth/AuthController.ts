import {Body, Controller, Post, UsePipes, ValidationPipe, Version} from "@nestjs/common";
import CredentialsInRequest from "./CredentialsInRequest.js";
import AuthService from "./AuthService.js";
import SessionEntity from "./SessionEntity.js";

@Controller("/auth")
export default class AuthController {
	private readonly authService: AuthService;
	constructor(authService: AuthService) {
		this.authService = authService;
	}

	@Version(["1"])
	@Post("/login")
	@UsePipes(new ValidationPipe({transform: true, whitelist: true}))
	public async login(@Body() credentialsInRequest: CredentialsInRequest): Promise<SessionEntity> {
		return this.authService.login(credentialsInRequest);
	}
}
