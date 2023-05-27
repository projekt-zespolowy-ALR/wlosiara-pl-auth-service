export default class UsersMicroserviceReferenceUsernameAlreadyUsedError extends Error {
	public readonly username: string;

	public constructor(username: string) {
		super(`Username ${username} is already used`);
		this.username = username;
	}
}
