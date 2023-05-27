import {Injectable} from "@nestjs/common";
import AppConfig from "../../../app_config/AppConfig.js";
import UsersMicroserviceReferenceUsernameAlreadyUsedError from "./UsersMicroserviceReferenceUsernameAlreadyUsedError.js";
import UsersMicroserviceReferenceInternalError from "./UsersMicroserviceReferenceInternalError.js";
import type RegisterUserResponse from "./RegisterUserResponse.js";
@Injectable()
export default class UsersMicroserviceReference {
	private readonly appConfig: AppConfig;

	public constructor(appConfig: AppConfig) {
		this.appConfig = appConfig;
	}

	public requestUserCreation(username: string): Promise<RegisterUserResponse> {
		return fetch(`${this.appConfig.USERS_MICROSERVICE_BASE_URL}/register-user`, {
			method: "POST",
			body: JSON.stringify({username}),
			headers: {
				"Content-Type": "application/json",
			},
		}).then(async (response) => {
			if (!response.ok) {
				const errorBody = await response.json();
				if (errorBody.code === "USERNAME_ALREADY_USED") {
					throw new UsersMicroserviceReferenceUsernameAlreadyUsedError(username);
				}
				throw new UsersMicroserviceReferenceInternalError();
			}
			return (await response.json().catch(() => {
				throw new UsersMicroserviceReferenceInternalError();
			})) as RegisterUserResponse;
		});
	}
}
