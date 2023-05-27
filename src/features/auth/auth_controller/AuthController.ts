import {Controller, Post, Body, ValidationPipe, ConflictException} from "@nestjs/common";
import AuthService from "../auth_service/AuthService.js";
import RegisterUserRequestBody from "./RegisterUserRequestBody.js";
import type UserCredentials from "./UserCredentials.js";
import payloadifyRegisterUserRequestBody from "./PayloadifyRegisterUserRequestBody.js";
import EmailAlreadyExistsError from "../auth_service/EmailAlreadyExistsError.js";
import UsersMicroserviceReferenceUsernameAlreadyUsedError from "../auth_service/UsersMicroserviceReferenceUsernameAlreadyUsedError.js";
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
		try {
			return await this.authService.registerUser(
				payloadifyRegisterUserRequestBody(registerUserRequestBody)
			);
		} catch (error) {
			if (error instanceof EmailAlreadyExistsError) {
				throw new ConflictException(error.message);
			}
			if (error instanceof UsersMicroserviceReferenceUsernameAlreadyUsedError) {
				throw new ConflictException(error.message);
			}
			throw error;
		}
	}
}
