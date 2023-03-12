import Zod from "zod";
import openApiConfigSchema from "./openApiConfigSchema.js";

type OpenApiConfig = Readonly<Zod.infer<typeof openApiConfigSchema>>;

export default OpenApiConfig;
