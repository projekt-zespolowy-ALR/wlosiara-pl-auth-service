import {Module} from "@nestjs/common";
import AppConfigModule from "./config/AppConfigModule.js";
import AppOrmModule from "./orm/AppOrmModule.js";
import CatsModule from "./features/cats/CatsModule.js";

import HelloModule from "./features/hello/HelloModule.js";

@Module({
	imports: [CatsModule, AppOrmModule, AppConfigModule, HelloModule],
	controllers: [],
	providers: [],
})
class AppModule {
	constructor() {}
}

export default AppModule;
