import {Controller, Post, Body, ValidationPipe} from "@nestjs/common";
import AuthService from "../auth_service/AuthService.js";
import RegisterUserRequestBody from "./RegisterUserRequestBody.js";
import type UserCredentials from "./UserCredentials.js";
import payloadifyRegisterUserRequestBody from "./PayloadifyRegisterUserRequestBody.js";
@Controller("/auth")
export default class AuthController {
	private readonly authService: AuthService;
	constructor(authService: AuthService) {
		this.authService = authService;
	}
	@Post("/register")
	public async registerUser(
		@Body(
			new ValidationPipe({
				transform: true,
				whitelist: true,
				forbidNonWhitelisted: true,
			})
		)
		registerUserRequestBody: RegisterUserRequestBody
	): Promise<UserCredentials> {
		return this.authService.registerUser(
			payloadifyRegisterUserRequestBody(registerUserRequestBody)
		);
	}
}
