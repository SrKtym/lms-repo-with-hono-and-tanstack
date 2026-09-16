import { fullRoutes } from "@lms-repo/api";
import { auth } from "@lms-repo/auth/server";
import { env } from "@lms-repo/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { authMiddleware } from "./middleware/auth";
import { oidcMiddleware } from "./middleware/oidc";
import { securityMiddleware } from "./middleware/security";

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
	// クライアントからの/api/authへのリクエストに対する処理
	.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))
	// OIDC認証ミドルウェア（Cloud Scheduler用）
	.post("/api/notifications/reminder", oidcMiddleware)
	// 認証ミドルウェア
	.use("*", authMiddleware)
	// レート制限、ボット検出
	.use("*", async (c, next) => {
		const method = c.req.method;
		const path = c.req.path;

		// 非対象のメソッド
		const allowMethods = ["GET", "OPTIONS"];

		// 対象のパス（メール送信を伴う処理と署名付きURLを取得する処理）
		const appliedPaths = [
			"/api/professors/announcements",
			"/api/professors/assignments",
			"/api/notifications/reminder",
			"/api/submissions/signed_urls",
		];

		// レスポンス速度に影響するので、特定のメソッド、パスのみに適用
		const isTargetMethod = !allowMethods.includes(method);
		const isTargetPath = appliedPaths.some((p) => path.startsWith(p));

		if (isTargetMethod && isTargetPath) {
			return securityMiddleware(c, next);
		}

		return next();
	})
	// ルーティング
	.route("/", fullRoutes);

export default app;
