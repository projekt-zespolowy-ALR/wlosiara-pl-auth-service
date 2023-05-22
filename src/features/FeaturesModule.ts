import {Module} from "@nestjs/common";
import AuthModule from "./auth/auth_module/AuthModule.js";

@Module({
	imports: [AuthModule],
	controllers: [],
	providers: [],
})
class FeaturesModule {
	public constructor() {}
}

export default FeaturesModule;
