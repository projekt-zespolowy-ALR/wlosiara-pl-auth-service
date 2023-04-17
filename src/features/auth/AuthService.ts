import {Injectable} from "@nestjs/common";
import {Repository} from "typeorm";
import CredentialsEntity from "./CredentialsEntity.js";
import CredentialsInRequest from "./CredentialsInRequest.js";
import {hashPassword} from "./utils.js";
import bcrypt from "bcrypt";
import SessionEntity from "./SessionEntity.js";

@Injectable()
class AuthService {
	private readonly credentialsRepository: Repository<CredentialsEntity>;
	private readonly sessionRepository: Repository<SessionEntity>;

	constructor(
		credentialsRepository: Repository<CredentialsEntity>,
		sessionRepository: Repository<SessionEntity>
	) {
		this.credentialsRepository = credentialsRepository;
		this.sessionRepository = sessionRepository;
	}
	public async getCredentials(): Promise<CredentialsEntity[]> {
		return this.credentialsRepository.find();
	}

	private async getCredentialsById(id: string): Promise<CredentialsEntity> {
		return this.credentialsRepository.findOneByOrFail({id});
	}

	private async getCredentialsByEmail(email: string): Promise<CredentialsEntity> {
		return this.credentialsRepository.findOneByOrFail({email});
	}
	public async createCredentials(credentials: CredentialsInRequest): Promise<CredentialsEntity> {
		if (await this.getCredentialsByEmail(credentials.email)) {
			throw new Error("Credentials already exist");
		} else {
			const hash: string = await hashPassword(credentials.password);
			const credentialsToCreate: Readonly<Omit<CredentialsEntity, "id">> = {
				email: credentials.email,
				hash: hash,
			};
			return this.credentialsRepository.save(credentialsToCreate);
		}
	}

	public async updateCredentials(
		id: string,
		credentials: CredentialsInRequest
	): Promise<CredentialsEntity> {
		const credentialsToUpdate: CredentialsEntity = await this.getCredentialsById(id);
		const updatedCredentials: CredentialsEntity = {
			id: credentialsToUpdate.id,
			email: credentials.email,
			hash: await hashPassword(credentials.password),
		};
		return this.credentialsRepository.save(updatedCredentials);
	}

	public async deleteCredentials(id: string): Promise<void> {
		await this.credentialsRepository.delete(id);
	}

	private async getCredentialsByEmailAndHash(
		email: string,
		hash: string
	): Promise<CredentialsEntity> {
		return this.credentialsRepository.findOneByOrFail({email, hash});
	}

	public async login(credentials: CredentialsInRequest): Promise<SessionEntity> {
		const CredentialsInDB: CredentialsEntity = await this.getCredentialsByEmail(credentials.email);
		if (!(await bcrypt.compare(credentials.password, CredentialsInDB.hash))) {
			throw new Error("Invalid credentials");
		} else {
			return await this.createNewSession(CredentialsInDB.id);
		}
	}

	private async createNewSession(credentialsId: string): Promise<SessionEntity> {
		const sessionToCreate: Readonly<Omit<SessionEntity, "id">> = {
			credentialsId: credentialsId,
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 6), // 6 hours
		};
		return await this.sessionRepository.save(sessionToCreate);
	}

	public async logout(sessionId: string): Promise<void> {
		if (await this.getSessionById(sessionId)) {
			await this.sessionRepository.delete(sessionId);
		} else {
			throw new Error("Invalid session");
		}
	}

	private async getSessionById(id: string): Promise<SessionEntity> {
		return this.sessionRepository.findOneByOrFail({id});
	}
}

export default AuthService;
