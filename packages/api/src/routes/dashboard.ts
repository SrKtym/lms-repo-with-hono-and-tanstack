import type { AuthVariables } from "@lms-repo/auth/server";
import { fetchAssignmentsFromUserCourses } from "@lms-repo/db/utils/query/assignments";
import { fetchRegisteredCourses } from "@lms-repo/db/utils/query/courses";
import { fetchNotifications } from "@lms-repo/db/utils/query/notifications";
import { fetchSchedules } from "@lms-repo/db/utils/query/schedules";
import { fetchSubmissionsState } from "@lms-repo/db/utils/query/submissions";
import { Hono } from "hono";
import { requireRole } from "../middleware/authorization";

// ユースケース指向の集約エンドポイント
export const dashboardRoute = new Hono<{ Variables: AuthVariables }>().get(
	"/summary",
	requireRole("student"),
	async (c) => {
		const { userId } = c.get("session");
		const [registrations, schedules, notifications, assignments, submissions] =
			await Promise.all([
				fetchRegisteredCourses(userId),
				fetchSchedules(userId),
				fetchNotifications(userId, 10, 0),
				fetchAssignmentsFromUserCourses(userId),
				fetchSubmissionsState(userId),
			]);
		return c.json(
			{ registrations, schedules, notifications, assignments, submissions },
			200,
		);
	},
);
