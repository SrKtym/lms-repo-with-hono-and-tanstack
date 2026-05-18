import { Hono } from "hono";
import { announcementsRoute } from "./routes/announcements";
import { assignmentsRoute } from "./routes/assignments";
import { coursesRoute } from "./routes/courses";
import { notificationsRoute } from "./routes/notifications";
import { schedulesRoute } from "./routes/schedules";
import { studentsRoute } from "./routes/students";
import { submissionsRoute } from "./routes/submissions";

export const fullRoutes = new Hono()
	.basePath("/api")
	.route("/courses", coursesRoute)
	.route("/schedules", schedulesRoute)
	.route("/assignments", assignmentsRoute)
	.route("/announcements", announcementsRoute)
	.route("/submissions", submissionsRoute)
	.route("/notifications", notificationsRoute)
	.route("/students", studentsRoute);

export type FullRoutes = typeof fullRoutes;
