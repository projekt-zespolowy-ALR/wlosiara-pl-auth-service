import {IsInt, IsOptional, Max, Min} from "class-validator";
import {Type} from "class-transformer";

class PagingOptions {
	@IsInt()
	@Min(0)
	@Type(() => Number)
	@IsOptional()
	public readonly skip = 0;

	@IsInt()
	@Min(0)
	@Max(100)
	@Type(() => Number)
	@IsOptional()
	public readonly take = 10;
}

export default PagingOptions;
