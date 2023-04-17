import {IsNotEmpty, IsNumber, IsString} from "class-validator";

class CatInPostRequest {
	@IsNotEmpty()
	@IsString()
	public readonly name!: string;

	@IsNumber()
	public readonly age!: number;

	@IsNotEmpty()
	@IsString()
	public readonly breed!: string;
}

export default CatInPostRequest;
