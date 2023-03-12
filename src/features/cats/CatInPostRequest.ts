import {IsNotEmpty, IsNumber, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

class CatInPostRequest {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	public readonly name!: string;
	@ApiProperty()
	@IsNumber()
	public readonly age!: number;
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	public readonly breed!: string;
}

export default CatInPostRequest;
