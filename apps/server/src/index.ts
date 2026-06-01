import { fullRoutes } from "@lms-repo/api";
import { auth } from "@lms-repo/auth/server";
import { env } from "@lms-repo/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authMiddleware } from "./middleware/auth";
import { securityMiddleware } from "./middleware/security";
import { secureHeaders } from "hono/secure-headers";

const app = new Hono()
	.use(
		"*",
		// グローバルミドルウェア
		logger(),
		cors({
			origin: env.CORS_ORIGIN,
			allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
			allowHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
		secureHeaders(),
	)
	// 認証ミドルウェア
	.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))
	.use("*", authMiddleware)
	.on(["POST", "PUT", "DELETE"], "*", securityMiddleware)
	// ルーティング
	.route("/", fullRoutes);

export default app;
