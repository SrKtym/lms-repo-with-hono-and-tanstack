import { env } from "@lms-repo/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let databaseUrl: string;

if (env.IS_SEEDING === "true") {
	databaseUrl = env.DATABASE_URL;
} else if (env.NODE_ENV === "development" && env.DATABASE_URL_FOR_DOCKER) {
	databaseUrl = env.DATABASE_URL_FOR_DOCKER;
} else {
	databaseUrl = env.DATABASE_URL;
}

const pool = new Pool({
	connectionString: databaseUrl,
	ssl: databaseUrl.includes("supabase") && { rejectUnauthorized: true },
});

export const db = drizzle(pool, { schema });
