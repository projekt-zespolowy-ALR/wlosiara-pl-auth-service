import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import UserCredentialsEntity from "./UserCredentialsEntity.js";
import type UserCredentials from "../auth_service/RegisterUserPayload.js";
import type RegisterUserPayload from "../auth_service/RegisterUserPayload.js";

@Injectable()
export default class AuthService {
	private readonly userCredentialsRepository: Repository<UserCredentialsEntity>;
	public constructor(
		@InjectRepository(UserCredentialsEntity)
		userCredentialsRepository: Repository<UserCredentialsEntity>
	) {
		this.userCredentialsRepository = userCredentialsRepository;
	}

	public async registerUser(userCredentials: RegisterUserPayload): Promise<UserCredentialsEntity> {
		// TODO: external api call to create user with username && then save user credentials (without the username)
		return this.userCredentialsRepository.save(userCredentials);
	}
}
