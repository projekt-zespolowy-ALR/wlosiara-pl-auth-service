import * as Dotenv from "dotenv";
import * as Path from "path";
Dotenv.config({path: Path.join(__dirname, "..", ".env.test")});

import testsConfigSchema from "./testsConfigSchema.js";
import * as Envalid from "envalid";

const testsConfig = Envalid.cleanEnv(process.env, testsConfigSchema);

export default testsConfig;
