import {Module} from "@nestjs/common";
import AppConfigModule from "./app_config/AppConfigModule.js";
import AppOrmModule from "./app_orm/AppOrmModule.js";

import FeaturesModule from "./features/FeaturesModule.js";

@Module({
	imports: [AppOrmModule, AppConfigModule, FeaturesModule],
	controllers: [],
	providers: [],
})
class AppModule {
	public constructor() {}
}

export default AppModule;
