import {IsInt, IsString, Min, Max} from "class-validator";
import {Type} from "class-transformer";

class AppConfig {
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(65535)
	public readonly PORT: number = 3000;

	@Type(() => String)
	@IsString()
	public readonly POSTGRES_HOST: string = "localhost";

	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(65535)
	public readonly POSTGRES_PORT: number = 5432;

	@Type(() => String)
	@IsString()
	public readonly POSTGRES_USERNAME: string = "postgres";

	@Type(() => String)
	@IsString()
	public readonly POSTGRES_PASSWORD: string = "postgres";

	@Type(() => String)
	@IsString()
	public readonly POSTGRES_DATABASE: string = "postgres";

	@Type(() => String)
	@IsString()
	public readonly USERS_MICROSERVICE_BASE_URL!: string;
}

export default AppConfig;
