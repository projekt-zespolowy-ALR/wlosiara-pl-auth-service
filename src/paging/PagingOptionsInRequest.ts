import {IsInt, IsOptional, Max, Min} from "class-validator";
import {plainToClass, Type} from "class-transformer";
import PagingOptions from "./PagingOptions.js";

class PagingOptionsInRequest {
	@IsInt()
	@Min(0)
	@Type(() => Number)
	@IsOptional()
	public readonly "paging-skip"?: number;

	@IsInt()
	@Min(0)
	@Max(100)
	@Type(() => Number)
	@IsOptional()
	public readonly "paging-take"?: number;

	public toPagingOptions(): PagingOptions {
		return plainToClass(
			PagingOptions,
			{
				skip: this["paging-skip"],
				take: this["paging-take"],
			},
			{
				exposeDefaultValues: true,
			}
		);
	}
}

export default PagingOptionsInRequest;
