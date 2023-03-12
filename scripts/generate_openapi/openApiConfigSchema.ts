import Zod from "zod";

const openApiConfigSchema = Zod.object({
	outputFilePath: Zod.string().optional(),
	openApiVersion: Zod.string().nonempty(),
	info: Zod.object({
		title: Zod.string().nonempty(),
		version: Zod.string().nonempty(),
	}),
});

export default openApiConfigSchema;
