import {IsEmail, IsNotEmpty} from "class-validator";

export default class LoginUserRequestBody {
	@IsNotEmpty()
	@IsEmail()
	public readonly email!: string;

	@IsNotEmpty()
	public readonly hashedPassword!: string;
}
