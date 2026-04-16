import { auth } from "@lms-repo/auth/server";
import { Hono } from "hono";

export const authRoute = new Hono().on(["POST", "GET"], "/*", (c) =>
	auth.handler(c.req.raw),
);
