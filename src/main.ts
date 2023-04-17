import {NestFactory} from "@nestjs/core";
import AppModule from "./AppModule.js";
import {FastifyAdapter, type NestFastifyApplication} from "@nestjs/platform-fastify";
import AppConfig from "./app_config/AppConfig.js";
import initializeApp from "./initializeApp.js";

const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
initializeApp(app);
const appConfig = app.get(AppConfig);
await app.listen(appConfig.PORT);
console.log(`Nest.js server listening at ${await app.getUrl()}`);
