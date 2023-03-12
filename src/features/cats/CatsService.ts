import {Injectable} from "@nestjs/common";
import {Repository} from "typeorm";
import CatEntity from "./CatEntity.js";
import {InjectRepository} from "@nestjs/typeorm";
import CatInPostRequest from "./CatInPostRequest.js";
import Page from "../../paging/Page.js";
import PageMeta from "../../paging/PageMeta.js";
import PagingOptions from "../../paging/PagingOptions.js";

@Injectable()
class CatsService {
	private readonly catsRepository: Repository<CatEntity>;
	constructor(@InjectRepository(CatEntity) catsRepository: Repository<CatEntity>) {
		this.catsRepository = catsRepository;
	}
	public async getCats(pagingOptions: PagingOptions): Promise<Page<CatEntity>> {
		const [cats, total] = await this.catsRepository.findAndCount({
			take: pagingOptions.take,
			skip: pagingOptions.skip,
		});
		const pageMeta: PageMeta = {
			totalItemsCount: total,
			pageItemsCount: cats.length,
			skip: pagingOptions.skip,
			take: pagingOptions.take,
		};
		const page: Page<CatEntity> = {
			meta: pageMeta,
			data: cats,
		};
		return page;
	}
	public async getCatById(id: string): Promise<CatEntity> {
		return this.catsRepository.findOneByOrFail({id});
	}
	public async createCat(catInPostRequest: CatInPostRequest): Promise<CatEntity> {
		const catToCreate: Readonly<Omit<CatEntity, "id">> = {
			age: catInPostRequest.age,
			breed: catInPostRequest.breed,
			name: catInPostRequest.name,
		};
		return this.catsRepository.save(catToCreate);
	}
}

export default CatsService;
