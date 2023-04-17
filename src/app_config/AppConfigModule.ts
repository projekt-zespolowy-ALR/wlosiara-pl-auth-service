import {TypedConfigModule, dotenvLoader} from "nest-typed-config";
import AppConfig from "./AppConfig.js";

const AppConfigModule = TypedConfigModule.forRoot({
	schema: AppConfig,
	load: dotenvLoader(),
});

export default AppConfigModule;
