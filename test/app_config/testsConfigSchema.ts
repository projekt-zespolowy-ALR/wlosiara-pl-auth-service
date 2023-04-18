import * as Envalid from "envalid";

const testsConfigSchema = {
	TESTS_POSTGRESQL_CONTAINER_DATABASE_NAME: Envalid.str(),
	TESTS_POSTGRESQL_CONTAINER_IMAGE_NAME: Envalid.str(),
	TESTS_POSTGRESQL_INITIALIZATION_SQL_SCRIPT_PATH: Envalid.str(),
	TESTS_INTEGRATION_TEST_BEFORE_EACH_TIMEOUT: Envalid.num(),
} as const;

export default testsConfigSchema;
