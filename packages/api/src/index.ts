import { Hono } from "hono";
import { announcementsRouteForCommon } from "./routes/announcements";
import { assignmentsRouteForCommon } from "./routes/assignments";
import { commentsRouteForCommon } from "./routes/comments";
import { coursesRouteForCommon } from "./routes/courses";
import { notificationsRouteForCommon } from "./routes/notifications";
import { professorsRoute } from "./routes/professors";
import { settingsRouteForCommon } from "./routes/settings";
import { studentsRoute } from "./routes/students";
import { submissionsRouteForCommon } from "./routes/submissions";

export const fullRoutes = new Hono()
	.basePath("/api")
	.route("/assignments", assignmentsRouteForCommon)
	.route("/announcements", announcementsRouteForCommon)
	.route("/comments", commentsRouteForCommon)
	.route("/courses", coursesRouteForCommon)
	.route("/notifications", notificationsRouteForCommon)
	.route("/professors", professorsRoute)
	.route("/settings", settingsRouteForCommon)
	.route("/students", studentsRoute)
	.route("/submissions", submissionsRouteForCommon);

export type FullRoutes = typeof fullRoutes;
