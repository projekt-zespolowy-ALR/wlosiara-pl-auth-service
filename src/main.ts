import {NestFactory} from "@nestjs/core";
import AppModule from "./AppModule.js";
import {FastifyAdapter, NestFastifyApplication} from "@nestjs/platform-fastify";
import AppConfig from "./config/AppConfig.js";
import {VersioningType} from "@nestjs/common";

const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
app.enableVersioning({
	type: VersioningType.URI,
});
const appConfig = app.get(AppConfig);
await app.listen(appConfig.PORT);
console.log(`Next.js server listening at ${await app.getUrl()}`);
