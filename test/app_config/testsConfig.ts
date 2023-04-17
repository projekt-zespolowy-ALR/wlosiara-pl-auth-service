import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({path: path.join(__dirname, "..", ".env.test")});

import testsConfigSchema from "./testsConfigSchema.js";
import * as envalid from "envalid";

const testsConfig = envalid.cleanEnv(process.env, testsConfigSchema);

export default testsConfig;
