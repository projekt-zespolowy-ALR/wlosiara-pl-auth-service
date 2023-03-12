import {Module} from "@nestjs/common";
import CatsController from "./CatsController.js";
import CatsService from "./CatsService.js";
import {TypeOrmModule} from "@nestjs/typeorm";
import CatEntity from "./CatEntity.js";

@Module({
	imports: [TypeOrmModule.forFeature([CatEntity])],
	controllers: [CatsController],
	providers: [CatsService],
})
class CatsModule {
	constructor() {}
}

export default CatsModule;
