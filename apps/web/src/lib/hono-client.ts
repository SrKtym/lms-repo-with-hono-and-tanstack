import type { FullRoutes } from "@lms-repo/api";
import { env } from "@lms-repo/env/web";
import { hc } from "hono/client";

export const client = hc<FullRoutes>(env.VITE_SERVER_URL);
