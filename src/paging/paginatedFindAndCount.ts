import type {Repository, FindOneOptions, ObjectLiteral} from "typeorm";
import type Page from "./Page.js";
import type PagingOptions from "./PagingOptions.js";
import buildPage from "./buildPage.js";

async function paginatedFindAndCount<Entity extends ObjectLiteral>(
	repository: Repository<Entity>,
	pagingOptions: PagingOptions,
	findOneOptions: FindOneOptions<Entity> = {}
): Promise<Page<Entity>> {
	const [entities, total]: [readonly Entity[], number] = await repository.findAndCount({
		...findOneOptions,
		...pagingOptions,
	});
	const page = buildPage({
		items: entities,
		totalItemsCount: total,
		skip: pagingOptions.skip,
		take: pagingOptions.take,
	});
	return page;
}

export default paginatedFindAndCount;
