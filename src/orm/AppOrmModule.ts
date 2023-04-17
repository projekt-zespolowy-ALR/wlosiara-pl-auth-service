import {TypeOrmModule} from "@nestjs/typeorm";

import AppConfig from "../app_config/AppConfig.js";

const AppOrmModule = TypeOrmModule.forRootAsync({
	inject: [AppConfig],
	useFactory: (config: AppConfig) => ({
		type: "postgres",
		host: config.POSTGRES_HOST,
		port: config.POSTGRES_PORT,
		username: config.POSTGRES_USERNAME,
		password: config.POSTGRES_PASSWORD,
		database: config.POSTGRES_DATABASE,
		autoLoadEntities: true,
		synchronize: false,
	}),
});

export default AppOrmModule;
