import { zValidator } from "@hono/zod-validator";
import type { Session } from "@lms-repo/auth/server";
import {
	registerStudentData,
	requestRoleChange,
} from "@lms-repo/db/utils/mutation/students";
import { fetchStudentData } from "@lms-repo/db/utils/query/students";
import { resend } from "@lms-repo/emails";
import RoleChangeRequestEmail from "@lms-repo/emails/components/role-change-request-email";
import { env } from "@lms-repo/env/server";
import { Hono } from "hono";
import { z } from "zod";
import { coursesRouteForStudent } from "./courses";
import { notificationsRouteForStudent } from "./notifications";
import { schedulesRouteForStudent } from "./schedules";
import { submissionsRouteForStudent } from "./submissions";

const formSchema = z.object({
	grade: z
		.number()
		.int("対象学年は整数で入力してください")
		.min(1, "対象学年は1から4の間で入力してください")
		.max(4, "対象学年は1から4の間で入力してください"),
	departmentName: z.string(),
});

// 学生関連のルート
export const studentsRoute = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	// 学生の所属登録
	.post("/", zValidator("json", formSchema), async (c) => {
		const { userId } = c.get("session");
		const { grade, departmentName } = c.req.valid("json");
		const result = await registerStudentData(userId, departmentName, grade);
		return c.json(result);
	})
	// ユーザーロール変更の申請
	.post("/role_change_request", async (c) => {
		const { id, email, name } = c.get("user");
		const result = await requestRoleChange(id);

		if ("error" in result) {
			return c.json(result);
		}

		const { adminEmail } = result;
		const viewUrl = `${env.CORS_ORIGIN}/admin`;
		await resend.emails.send({
			from: env.EMAIL_ADDRESS,
			to: adminEmail,
			subject: "教員アカウントへの変更申請",
			react: RoleChangeRequestEmail({
				adminEmail,
				email,
				name,
				viewUrl,
			}),
		});

		return c.json(
			{ message: "教員アカウントへの変更申請が送信されました" },
			200,
		);
	})
	// 学生のデータ取得
	.get("/data", async (c) => {
		const { userId } = c.get("session");
		const result = await fetchStudentData(userId);
		if (!result) {
			return c.json({ error: "学生情報が見つかりません" }, 404);
		}
		return c.json(result);
	})
	.route("/courses", coursesRouteForStudent)
	.route("/notifications", notificationsRouteForStudent)
	.route("/schedules", schedulesRouteForStudent)
	.route("/submissions", submissionsRouteForStudent);
