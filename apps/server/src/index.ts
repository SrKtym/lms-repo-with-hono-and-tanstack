import { fullRoutes } from "@lms-repo/api";
import { auth } from "@lms-repo/auth/server";
import { env } from "@lms-repo/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authMiddleware } from "./middleware/auth";

const app = new Hono()
	.basePath("/api")
	.use(
		"/*",
		// グローバルミドルウェア
		logger(),
		cors({
			origin: env.CORS_ORIGIN,
			allowMethods: ["GET", "POST", "OPTIONS"],
			allowHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
		// secureHeaders({
		// contentSecurityPolicy: {
		// 	defaultSrc: ["'self'"],
		// 	// スタイルシート(css)の読み込みを同一オリジンに制限
		// 	styleSrc: ["'self'"],
		// 	// javascriptの読み込み・実行を同一オリジンに制限
		// 	scriptSrc: ["'self'"],
		// 	// 画像の読み込みを同一オリジンとインラインデータ(HTML/CSSに直接埋め込まれた画像)、HTTPS通信による外部サイトからのみに制限
		// 	imgSrc: ["'self'", "data:", "https:"],
		// 	// フォントの読み込みを同一オリジンとHTTPSに制限
		// 	fontSrc: ["'self'", "https:"],
		// 	// コネクションを同一オリジンと指定オリジンに制限
		// 	connectSrc: ["'self'", env.CORS_ORIGIN],
		// 	// iframeの埋め込みを禁止
		// 	frameAncestors: ["'none'"],
		// 	// baseタグの使用を禁止
		// 	baseUri: ["'none'"],
		// },
		// }),
	)
	// 認証ミドルウェア
	.on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw))
	// ルーティング
	.route("/", fullRoutes.use(authMiddleware));

export default app;
