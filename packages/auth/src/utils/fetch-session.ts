import { auth } from "@lms-repo/auth/server";
import type { Context } from "hono";

export async function fetchSession(c: Context) {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});
	return session;
}
