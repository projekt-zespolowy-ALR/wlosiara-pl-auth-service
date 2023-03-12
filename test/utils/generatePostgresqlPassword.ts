function generatePostgresqlPassword() {
	return Math.random().toString(36).substring(2);
}

export default generatePostgresqlPassword;
