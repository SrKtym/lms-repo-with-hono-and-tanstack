import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/schema",
	out: "./src/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: "postgresql://test_user:test_password@localhost:5433/test_lms",
	},
});
