import { auth } from "@lms-repo/auth/server";
import type { Context } from "hono";

export const fetchSession = async (c: Context) => {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});
	return session;
};
