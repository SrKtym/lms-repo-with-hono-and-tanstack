import { zValidator } from "@hono/zod-validator";
import type { Session } from "@lms-repo/auth/server";
import { registerProfData } from "@lms-repo/db/utils/mutation/professors";
import { fetchProfData } from "@lms-repo/db/utils/query/professors";
import { Hono } from "hono";
import { z } from "zod";
import { announcementsRouteForProf } from "./announcements";
import { assignmentsRouteForProf } from "./assignments";
import { coursesRouteForProf } from "./courses";
import { submissionsRouteForProf } from "./submissions";

export const professorsRoute = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	// 教授の所属登録
	.post(
		"/",
		zValidator("json", z.object({ departmentName: z.string() })),
		async (c) => {
			const { userId } = c.get("session");
			const { departmentName } = c.req.valid("json");
			const { status, ...body } = await registerProfData(
				userId,
				departmentName,
			);
			return c.json(body, status);
		},
	)
	// 教授のプロフィール情報取得
	.get("/profile", async (c) => {
		const { userId } = c.get("session");
		const result = await fetchProfData(userId);

		if (!result) {
			return c.json({ error: "プロフィール情報が見つかりませんでした" }, 404);
		}
		return c.json(result, 200);
	})
	.route("/announcements", announcementsRouteForProf)
	.route("/assignments", assignmentsRouteForProf)
	.route("/courses", coursesRouteForProf)
	.route("/submissions", submissionsRouteForProf);
