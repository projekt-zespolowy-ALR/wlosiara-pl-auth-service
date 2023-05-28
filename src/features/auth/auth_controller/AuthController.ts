import {
	Controller,
	Post,
	Body,
	ValidationPipe,
	ConflictException,
	BadRequestException,
} from "@nestjs/common";
import AuthService from "../auth_service/AuthService.js";
import RegisterUserRequestBody from "./RegisterUserRequestBody.js";
import type UserCredentials from "./UserCredentials.js";
import payloadifyRegisterUserRequestBody from "./PayloadifyRegisterUserRequestBody.js";
import EmailAlreadyExistsError from "../auth_service/EmailAlreadyExistsError.js";
import UsersMicroserviceReferenceUsernameAlreadyUsedError from "../auth_service/UsersMicroserviceReferenceUsernameAlreadyUsedError.js";
import LoginUserRequestBody from "./LoginUserRequestBody.js";
import payloadifyLoginUserRequestBody from "./PayloadifyLoginUserRequestBody.js";
import EmailOrPasswordInvalidError from "../auth_service/EmailOrPasswordInvalidError.js";
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

	@Post("/login")
	public async loginUser(
		@Body(
			new ValidationPipe({
				transform: true,
				whitelist: true,
				forbidNonWhitelisted: true,
			})
		)
		loginUserRequestBody: LoginUserRequestBody
	) {
		try {
			return await this.authService.loginUser(payloadifyLoginUserRequestBody(loginUserRequestBody));
		} catch (error) {
			if (error instanceof EmailOrPasswordInvalidError) {
				throw new BadRequestException(error.message);
			}
			throw error;
		}
	}
}
