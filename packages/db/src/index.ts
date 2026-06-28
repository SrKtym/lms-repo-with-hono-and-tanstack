import { env } from "@lms-repo/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const databaseUrl =
	env.NODE_ENV === "development"
		? env.DATABASE_URL_FOR_DOCKER
		: env.DATABASE_URL;

const pool = new Pool({
	connectionString: databaseUrl,
	ssl: databaseUrl.includes("supabase") ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });
