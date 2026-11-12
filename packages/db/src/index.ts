import { env } from "@lms-repo/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// 証明書ファイルの読み込み（base64エンコード）
let caContent: string | undefined;
if (env.NODE_ENV === "production" && env.DATABASE_URL.includes("supabase")) {
	const caCertBase64 = process.env.SUPABASE_CA_CERT_B64;

	if (!caCertBase64) {
		console.warn("SUPABASE_CA_CERT_B64 is not set, using default SSL settings");
	} else {
		try {
			caContent = Buffer.from(caCertBase64, "base64").toString("utf8");
		} catch {
			console.warn(
				"Failed to decode SUPABASE_CA_CERT_B64, using default SSL settings",
			);
		}
	}
}

const pool = new Pool({
	connectionString: env.DATABASE_URL,
	ssl: env.DATABASE_URL.includes("supabase")
		? {
				rejectUnauthorized: true,
				...(caContent && { ca: caContent }),
			}
		: undefined,
});

export const db = drizzle(pool, { schema });
