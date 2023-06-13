export default class EmailOrPasswordInvalidError extends Error {
	public readonly email: string;

	public constructor(email: string) {
		super(`Wrong email or password`);
		this.email = email;
	}
}
