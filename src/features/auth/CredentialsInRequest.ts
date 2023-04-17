import {IsString, IsNotEmpty, IsEmail} from "class-validator";

class CredentialsInRequest {
	@IsNotEmpty()
	@IsEmail()
	public readonly email!: string;

	@IsNotEmpty()
	@IsString()
	public readonly password!: string;
}

export default CredentialsInRequest;
