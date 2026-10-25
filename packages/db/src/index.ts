import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
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

// 証明書ファイルの読み込み（本番環境のみ）
let caContent: string | undefined;
if (env.NODE_ENV === "production" && databaseUrl.includes("supabase")) {
	try {
		const caPath = fileURLToPath(
			new URL("../certs/prod-ca-2021.crt", import.meta.url),
		);
		caContent = readFileSync(caPath, "utf-8");
	} catch {
		console.warn("Certificate file not found, skipping CA certificate");
	}
}

const pool = new Pool({
	connectionString: databaseUrl,
	ssl: databaseUrl.includes("supabase")
		? {
				rejectUnauthorized: true,
				...(caContent && { ca: caContent }),
			}
		: undefined,
});

export const db = drizzle(pool, { schema });
