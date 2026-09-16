import { env } from "@lms-repo/env/server";
import { OAuth2Client } from "google-auth-library";
import { createMiddleware } from "hono/factory";

// Cloud Scheduler OIDC認証ミドルウェア
export const oidcMiddleware = createMiddleware(async (c, next) => {
	const authHeader = c.req.header("Authorization");

	if (!authHeader?.startsWith("Bearer ")) {
		return c.json({ error: "missing authorization header" }, 401);
	}

	const token = authHeader.substring(7);

	try {
		// Google OIDCトークンを検証
		const client = new OAuth2Client();
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: env.GOOGLE_CLOUD_PROJECT,
		});

		const payload = ticket.getPayload();

		if (!payload?.email) {
			return c.json({ error: "invalid token payload" }, 401);
		}

		// サービスアカウントのEmailを検証
		if (env.SCHEDULER_SERVICE_ACCOUNT_EMAIL) {
			if (payload.email !== env.SCHEDULER_SERVICE_ACCOUNT_EMAIL) {
				return c.json({ error: "unauthorized service account" }, 403);
			}
		}

		// サービスアカウント情報をコンテキストに設定
		c.set("serviceAccount", {
			email: payload.email,
			subject: payload.sub,
		});

		return next();
	} catch (error) {
		console.error("OIDC verification failed:", error);
		return c.json({ error: "invalid token" }, 401);
	}
});
