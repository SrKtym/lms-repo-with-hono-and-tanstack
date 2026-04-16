import { Hono } from "hono";
import { announcementsRoute } from "./routes/announcements";
import { assignmentsRoute } from "./routes/assignments";
import { authRoute } from "./routes/auth";
import { coursesRoute } from "./routes/courses";
import { notificationsRoute } from "./routes/notifications";
import { schedulesRoute } from "./routes/schedules";

export const fullRoutes = new Hono()
	.route("/auth", authRoute)
	.route("/courses", coursesRoute)
	.route("/schedules", schedulesRoute)
	.route("/assignments", assignmentsRoute)
	.route("/announcements", announcementsRoute)
	.route("/notifications", notificationsRoute);

export type FullRoutes = typeof fullRoutes;
