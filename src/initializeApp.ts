import {VersioningType, type INestApplication} from "@nestjs/common";

export default function initializeApp(app: INestApplication) {
	app.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: ["1", "2"],
	});
}
