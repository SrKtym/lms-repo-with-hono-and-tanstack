import type { Session } from "@lms-repo/auth/server";
import { auth } from "@lms-repo/auth/server";
import { createMiddleware } from "hono/factory";

// 認証・認可ミドルウェア
export const authMiddleware = createMiddleware<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>(async (c, next) => {
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

	const { role } = session.user;

	// 認可チェック
	if (path.startsWith("/api/students")) {
		if (role === "professor") {
			return c.json({ error: "not authorized" }, 403);
		}
	} else if (path.startsWith("/api/professors")) {
		if (role === "student") {
			return c.json({ error: "not authorized" }, 403);
		}
	}

	return next();
});
