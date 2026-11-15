import { Hono } from "hono";
import { coursesRoute } from "./routes/courses";
import { dashboardRoute } from "./routes/dashboard";
import {
	notificationsReminderRoute,
	notificationsRoute,
} from "./routes/notifications";
import { professorsRoute } from "./routes/professors";
import { schedulesRoute } from "./routes/schedules";
import { settingsRoute } from "./routes/settings";
import { studentsRoute } from "./routes/students";

export const fullRoutes = new Hono()
	.basePath("/api")
	.route("/courses", coursesRoute)
	.route("/dashboard", dashboardRoute)
	.route("/notifications", notificationsRoute)
	.route("/notifications/reminder", notificationsReminderRoute)
	.route("/professors", professorsRoute)
	.route("/schedules", schedulesRoute)
	.route("/settings", settingsRoute)
	.route("/students", studentsRoute);

export type FullRoutes = typeof fullRoutes;
