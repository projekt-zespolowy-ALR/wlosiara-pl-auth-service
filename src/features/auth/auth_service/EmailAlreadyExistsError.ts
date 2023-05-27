export default class EmailAlreadyExistsError extends Error {
	public readonly email: string;

	public constructor(email: string) {
		super(`Email ${email} is already used`);
		this.email = email;
	}
}
