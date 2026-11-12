import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({
	path: ".env.db.test",
	encoding: "utf-8",
	debug: true,
});

const user = process.env.POSTGRES_USER;
const password = process.env.POSTGRES_PASSWORD;
const database = process.env.POSTGRES_DB;

if (!user || !password || !database) {
	throw new Error(
		"postgresql user, password, or database environment variable is not defined",
	);
}

export default defineConfig({
	schema: "./src/schema",
	out: "./src/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: `postgresql://${user}:${password}@localhost:5433/${database}`,
	},
});
