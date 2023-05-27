CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE user_credentials (
    id UUID DEFAULT uuid_generate_v4() NOT NULL,
    email TEXT NOT NULL,
    hashed_password TEXT NOT NULL,
    user_id UUID NOT NULL,
    PRIMARY KEY (id)
);
