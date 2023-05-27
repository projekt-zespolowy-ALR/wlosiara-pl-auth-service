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
@Injectable()
export default class AuthService {
	private readonly userCredentialsRepository: Repository<UserCredentialsEntity>;

	private usersMicroserviceReference: UsersMicroserviceReference;
	public constructor(
		@InjectRepository(UserCredentialsEntity)
		userCredentialsRepository: Repository<UserCredentialsEntity>,
		usersMicroserviceReference: UsersMicroserviceReference
	) {
		this.userCredentialsRepository = userCredentialsRepository;
		this.usersMicroserviceReference = usersMicroserviceReference;
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
}
