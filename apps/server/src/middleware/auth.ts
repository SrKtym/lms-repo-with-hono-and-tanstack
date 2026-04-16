import type { Session } from "@lms-repo/auth/server";
import { auth } from "@lms-repo/auth/server";
import { createMiddleware } from "hono/factory";

export const authMiddleware = createMiddleware<{
	Variables: {
		user: Session["user"] | null;
		session: Session["session"] | null;
	};
}>(async (c, next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session) {
		c.set("user", null);
		c.set("session", null);
		await next();
		return;
	}

	c.set("user", session.user);
	c.set("session", session.session);
	await next();
});
