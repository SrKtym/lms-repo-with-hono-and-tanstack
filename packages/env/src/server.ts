import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({
	encoding: "utf8",
	path: "../../apps/server/.env",
	debug: true,
});

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		DATABASE_URL_FOR_DOCKER: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		GOOGLE_CLIENT_SECRET: z.string().min(32),
		GOOGLE_CLIENT_ID: z.string().min(1),
		GITHUB_CLIENT_SECRET: z.string().min(32),
		GITHUB_CLIENT_ID: z.string().min(1),
		RESEND_API_KEY: z.string().min(32),
		ARCJET_KEY: z.string().min(32),
		CORS_ORIGIN: z.url(),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
