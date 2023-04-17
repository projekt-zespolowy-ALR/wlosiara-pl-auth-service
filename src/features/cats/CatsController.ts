import {
	Body,
	Controller,
	Get,
	HttpStatus,
	NotFoundException,
	Param,
	ParseUUIDPipe,
	Post,
	Query,
	ValidationPipe,
} from "@nestjs/common";

import {EntityNotFoundError} from "typeorm";
import CatEntity from "./CatEntity.js";
import CatInPostRequest from "./CatInPostRequest.js";
import CatsService from "./CatsService.js";
import Page from "../../paging/Page.js";
import PagingOptionsInRequest from "../../paging/PagingOptionsInRequest.js";

@Controller("/cats")
class CatsController {
	private readonly catsService: CatsService;
	constructor(catsService: CatsService) {
		this.catsService = catsService;
	}
	@Get("/")
	public async getAllCats(
		@Query(
			new ValidationPipe({
				transform: true, // Transform to instance of PagingOptionsInRequest
				whitelist: true, // Do not put other query parameters into the object
			})
		)
		pagingOptionsInRequest: PagingOptionsInRequest
	): Promise<Page<CatEntity>> {
		const pagingOptions = pagingOptionsInRequest.toPagingOptions();
		return this.catsService.getCats(pagingOptions);
	}
	@Get("/:id")
	public async getCatById(
		@Param(
			"id",
			new ParseUUIDPipe({
				errorHttpStatusCode: HttpStatus.NOT_FOUND,
				version: "4",
			})
		)
		id: string
	): Promise<CatEntity> {
		try {
			const targetCat = await this.catsService.getCatById(id);
			return targetCat;
		} catch (error) {
			if (error instanceof EntityNotFoundError) {
				throw new NotFoundException(`Cat with id "${id}" not found`);
			}
			throw error;
		}
	}

	@Post("/")
	public async createCat(
		@Body(
			new ValidationPipe({
				whitelist: true, // Do not allow other properties than those defined in CatInPostRequest
				forbidNonWhitelisted: true, // Throw an error if other properties than those defined in CatInPostRequest are present
			})
		)
		catInPostRequest: CatInPostRequest
	): Promise<CatEntity> {
		return this.catsService.createCat(catInPostRequest);
	}
}

export default CatsController;
