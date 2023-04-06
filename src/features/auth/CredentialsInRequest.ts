import {IsString, IsNotEmpty, IsEmail} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

class CredentialsInRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  public readonly email!: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public readonly password!: string;
}

export default CredentialsInRequest;