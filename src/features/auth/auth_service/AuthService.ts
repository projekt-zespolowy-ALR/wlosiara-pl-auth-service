import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import UserCredentialsEntity from "./UserCredentialsEntity.js";
import type RegisterUserPayload from "../auth_service/RegisterUserPayload.js";
import UsersMicroserviceReference from "./UsersMicroserviceReference.js";
import UsersMicroserviceReferenceUsernameAlreadyUsedError from "./UsersMicroserviceReferenceUsernameAlreadyUsedError.js";
import UsersMicroserviceReferenceInternalError from "./UsersMicroserviceReferenceInternalError.js";
import EmailAlreadyExistsError from "./EmailAlreadyExistsError.js";
import argon2 from "argon2";
import type LoginUserPayload from "./LoginUserPayload.js";
import EmailOrPasswordInvalidError from "./EmailOrPasswordInvalidError.js";
import UserSessionEntity from "./UserSessionEntity.js";
import * as crypto from "crypto";
import AppConfig from "../../../app_config/AppConfig.js";
import type UserCredentials from "../auth_controller/UserCredentials.js";
import type UserSession from "../auth_controller/UserSession.js";
import SessionNotFoundError from "./SessionNotFoundError.js";

@Injectable()
export default class AuthService {
	private readonly appConfig: AppConfig;
	private readonly userCredentialsRepository: Repository<UserCredentialsEntity>;
	private readonly userSessionRepository: Repository<UserSessionEntity>;

	private usersMicroserviceReference: UsersMicroserviceReference;
	public constructor(
		@InjectRepository(UserCredentialsEntity)
		userCredentialsRepository: Repository<UserCredentialsEntity>,
		@InjectRepository(UserSessionEntity)
		userSessionRepository: Repository<UserSessionEntity>,
		usersMicroserviceReference: UsersMicroserviceReference,
		appConfig: AppConfig
	) {
		this.userCredentialsRepository = userCredentialsRepository;
		this.userSessionRepository = userSessionRepository;
		this.usersMicroserviceReference = usersMicroserviceReference;
		this.appConfig = appConfig;
	}

	public async registerUser(userCredentials: RegisterUserPayload): Promise<UserCredentials> {
		if (
			await this.userCredentialsRepository.findOne({
				where: {
					email: userCredentials.email,
				},
			})
		) {
			throw new EmailAlreadyExistsError(userCredentials.email);
		}
		try {
			const response = await this.usersMicroserviceReference.requestUserCreation(
				userCredentials.username
			);

			const hash = await argon2.hash(userCredentials.password);

			return this.userCredentialsRepository.save({
				email: userCredentials.email,
				hashedPassword: hash,
				userId: response.id,
			});
		} catch (error) {
			if (error instanceof UsersMicroserviceReferenceUsernameAlreadyUsedError) {
				throw new UsersMicroserviceReferenceUsernameAlreadyUsedError(userCredentials.username);
			}
			if (error instanceof UsersMicroserviceReferenceInternalError) {
				throw new UsersMicroserviceReferenceInternalError();
			}
			throw error;
		}
	}

	public async loginUser(userCredentials: LoginUserPayload): Promise<UserSession> {
		const userCredentialsEntity = await this.userCredentialsRepository.findOne({
			where: {
				email: userCredentials.email,
			},
		});
		if (!userCredentialsEntity) {
			throw new EmailOrPasswordInvalidError(userCredentials.email);
		}
		if (!(await argon2.verify(userCredentialsEntity.hashedPassword, userCredentials.password))) {
			throw new EmailOrPasswordInvalidError(userCredentials.email);
		}

		const token = crypto.randomBytes(this.appConfig.TOKEN_LENGTH).toString("hex");
		return this.userSessionRepository.save({
			token: token,
			userId: userCredentialsEntity.userId,
		});
	}

	public async logoutUser(token: string): Promise<void> {
		const sessionEntity = await this.findUserSessionByToken(token);
		if (sessionEntity !== null) {
			await this.userSessionRepository.delete({
				token: sessionEntity.token,
			});
			return Promise.resolve();
		} else {
			throw new SessionNotFoundError();
		}
	}

	private async findUserSessionByToken(token: string): Promise<UserSessionEntity | null> {
		if (token) {
			const parsedToken = token.split(" ")[1] as string;
			return await this.userSessionRepository.findOne({
				where: {
					token: parsedToken,
				},
			});
		}
		return null;
	}

	public async getCurrentUser(token: string): Promise<string | null> {
		const sessionEntity = await this.findUserSessionByToken(token);
		if (sessionEntity !== null && sessionEntity.userId !== null) {
			return sessionEntity.userId;
		}
		return null;
	}
}
