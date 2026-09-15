import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { z } from "zod";

// 開発環境とテスト環境で.envファイルを読み込む
if (process.env.NODE_ENV !== "production") {
	const envFile = process.env.NODE_ENV === "test" 
		? "../../apps/server/.env.test"
		: "../../apps/server/.env";
	
	dotenv.config({
		path: envFile,
		encoding: "utf8",
		debug: true,
	});
}

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		DATABASE_URL_FOR_DOCKER: z.string().min(1).optional(),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		GOOGLE_CLIENT_SECRET: z.string().min(32),
		GOOGLE_CLIENT_ID: z.string().min(1),
		GH_CLIENT_SECRET: z.string().min(32),
		GH_CLIENT_ID: z.string().min(1),
		TWITTER_CLIENT_SECRET: z.string().min(32),
		TWITTER_CLIENT_ID: z.string().min(1),
		RESEND_API_KEY: z.string().min(32),
		EMAIL_ADDRESS: z.email(),
		ARCJET_KEY: z.string().min(32),
		GCS_EMULATOR_HOST: z.string().min(1).optional(),
		GCS_BUCKET_NAME: z.string().min(1),
		CORS_ORIGIN: z.url(),
		SCHEDULER_SERVICE_ACCOUNT_EMAIL: z.email().optional(),
		GOOGLE_CLOUD_PROJECT: z.string().min(1).optional(),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
