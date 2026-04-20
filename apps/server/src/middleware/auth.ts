import type { Session } from "@lms-repo/auth/server";
import { auth } from "@lms-repo/auth/server";
import { createMiddleware } from "hono/factory";

export const authMiddleware = createMiddleware<{
	Variables: {
		user: Session["user"]
		session: Session["session"]
	};
}>(async (c, next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session) {
		return c.json({ message: "not authenticated" }, 401);
	}

	c.set("user", session.user);
	c.set("session", session.session);
	await next();
});
