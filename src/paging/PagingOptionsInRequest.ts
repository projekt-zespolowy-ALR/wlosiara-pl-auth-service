import {IsInt, IsOptional, Max, Min} from "class-validator";
import {ApiPropertyOptional} from "@nestjs/swagger";
import {plainToClass, Type} from "class-transformer";
import PagingOptions from "./PagingOptions.js";

class PagingOptionsInRequest {
	@ApiPropertyOptional({
		default: 0,
		minimum: 0,
		type: Number,
	})
	@IsInt()
	@Min(0)
	@Type(() => Number)
	@IsOptional()
	public readonly "paging-skip"?: number;

	@ApiPropertyOptional({
		default: 10,
		minimum: 0,
		maximum: 100,
		type: Number,
	})
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
