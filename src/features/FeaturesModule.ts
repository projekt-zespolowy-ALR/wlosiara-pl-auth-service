import {Module} from "@nestjs/common";
import CatsModule from "./cats/CatsModule.js";
import HelloModule from "./hello/HelloModule.js";

@Module({
	imports: [CatsModule, HelloModule],
	controllers: [],
	providers: [],
})
class FeaturesModule {
	constructor() {}
}

export default FeaturesModule;
