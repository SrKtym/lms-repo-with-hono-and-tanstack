import { Hono } from "hono";
import { announcementsRoute } from "./routes/announcements";
import { assignmentsRoute } from "./routes/assignments";
import { coursesRoute } from "./routes/courses";
import { notificationsRoute } from "./routes/notifications";
import { schedulesRoute } from "./routes/schedules";
import { submissionsRoute } from "./routes/submissions";

export const fullRoutes = new Hono()
	.basePath("/api")
	.route("/courses", coursesRoute)
	.route("/schedules", schedulesRoute)
	.route("/assignments", assignmentsRoute)
	.route("/announcements", announcementsRoute)
	.route("/submissions", submissionsRoute)
	.route("/notifications", notificationsRoute);

export type FullRoutes = typeof fullRoutes;
