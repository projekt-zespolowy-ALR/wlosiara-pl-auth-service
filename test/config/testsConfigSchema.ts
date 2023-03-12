import * as envalid from "envalid";

const testsConfigSchema = {
	TESTS_POSTGRESQL_CONTAINER_DATABASE_NAME: envalid.str(),
	TESTS_POSTGRESQL_CONTAINER_IMAGE_NAME: envalid.str(),
	TESTS_POSTGRESQL_INITIALIZATION_SQL_SCRIPT_PATH: envalid.str(),
	TESTS_INTEGRATION_TEST_BEFORE_EACH_TIMEOUT: envalid.num(),
} as const;

export default testsConfigSchema;
