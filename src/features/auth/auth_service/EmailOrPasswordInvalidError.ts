export default class EmailOrPasswordInvalidError extends Error {
	public readonly email: string;

	public constructor(email: string) {
		super(`User with given email: ${email} does not exist`);
		this.email = email;
	}
}
