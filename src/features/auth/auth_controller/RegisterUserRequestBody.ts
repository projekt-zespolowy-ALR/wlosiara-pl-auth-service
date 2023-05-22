import {IsEmail, IsNotEmpty, IsString, IsUUID, MaxLength, MinLength} from "class-validator";

export default class RegisterUserRequestBody {
	@IsNotEmpty()
	@IsEmail()
	public readonly email!: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(8)
	@MaxLength(32)
	public readonly password!: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(3)
	@MaxLength(32)
	public readonly username!: string;
}
