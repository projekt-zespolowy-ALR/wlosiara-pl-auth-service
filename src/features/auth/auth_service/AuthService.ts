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
@Injectable()
export default class AuthService {
	private readonly appConfig: AppConfig;
	private readonly userCredentialsRepository: Repository<UserCredentialsEntity>;
	private readonly userSessionRepository: Repository<UserSessionEntity>;

	private usersMicroserviceReference: UsersMicroserviceReference;
	public constructor(
		@InjectRepository(UserCredentialsEntity)
		@InjectRepository(UserSessionEntity)
		userCredentialsRepository: Repository<UserCredentialsEntity>,
		userSessionRepository: Repository<UserSessionEntity>,
		usersMicroserviceReference: UsersMicroserviceReference,
		appConfig: AppConfig
	) {
		this.userCredentialsRepository = userCredentialsRepository;
		this.userSessionRepository = userSessionRepository;
		this.usersMicroserviceReference = usersMicroserviceReference;
		this.appConfig = appConfig;
	}

	public async registerUser(userCredentials: RegisterUserPayload): Promise<UserCredentialsEntity> {
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
				userId: response.userId,
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

	public async loginUser(userCredentials: LoginUserPayload): Promise<UserSessionEntity> {
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
}
