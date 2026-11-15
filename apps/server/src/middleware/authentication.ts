import type { AuthVariables } from "@lms-repo/auth/server";
import { auth } from "@lms-repo/auth/server";
import { createMiddleware } from "hono/factory";

// 認証ミドルウェア
export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
	async (c, next) => {
		const path = c.req.path;
		const method = c.req.method;

		// Cloud Scheduler用のOIDC認証済みルートはバイパス
		if (path === "/api/notifications/reminder" && method === "POST") {
			return next();
		}

		const session = await auth.api.getSession({ headers: c.req.raw.headers });

		// 認証チェック
		if (!session) {
			return c.json({ error: "not authenticated" }, 401);
		}

		c.set("user", session.user);
		c.set("session", session.session);

		return next();
	},
);
