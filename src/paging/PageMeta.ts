import {ApiProperty} from "@nestjs/swagger";

class PageMeta {
	@ApiProperty()
	readonly skip!: number;

	@ApiProperty()
	readonly take!: number;

	@ApiProperty()
	readonly totalItemsCount!: number;

	@ApiProperty()
	readonly pageItemsCount!: number;
}

export default PageMeta;
