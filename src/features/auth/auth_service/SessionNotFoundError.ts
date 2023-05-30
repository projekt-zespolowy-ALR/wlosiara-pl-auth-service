export default class SessionNotFoundError extends Error {
	public constructor() {
		super(`session with given token was not found`);
	}
}
