import { Hono } from "hono";
import { announcementsRoute } from "./routes/announcements";
import { assignmentsRoute } from "./routes/assignments";
import { coursesRoute } from "./routes/courses";
import { notificationsRoute } from "./routes/notifications";
import { schedulesRoute } from "./routes/schedules";

export const fullRoutes = new Hono()
	.route("api/courses", coursesRoute)
	.route("api/schedules", schedulesRoute)
	.route("api/assignments", assignmentsRoute)
	.route("api/announcements", announcementsRoute)
	.route("api/notifications", notificationsRoute);

export type FullRoutes = typeof fullRoutes;
