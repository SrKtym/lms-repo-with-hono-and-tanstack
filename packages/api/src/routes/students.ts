import { zValidator } from "@hono/zod-validator";
import type { AuthVariables } from "@lms-repo/auth/server";
import {
	registerStudentData,
	requestRoleChange,
} from "@lms-repo/db/utils/mutation/students";
import { fetchStudentData } from "@lms-repo/db/utils/query/students";
import { resend } from "@lms-repo/emails";
import RoleChangeRequestEmail from "@lms-repo/emails/components/role-change-request-email";
import { env } from "@lms-repo/env/server";
import { Hono } from "hono";
import { requireRole } from "../middleware/authorization";
import { formSchema } from "../schema/students";

// 学生関連のルート
export const studentsRoute = new Hono<{ Variables: AuthVariables }>()
	.basePath("/me")
	// ユーザーロール変更の申請
	.post("/role-change-request", requireRole("student"), async (c) => {
		const { id, email, name } = c.get("user");
		const result = await requestRoleChange(id);

		if ("error" in result) {
			const { status, ...body } = result;
			return c.json(body, status);
		}

		const { adminEmail } = result;
		const viewUrl = `${env.CORS_ORIGIN}/admin`;
		await resend.emails.send({
			from: `LMS-repo <${env.EMAIL_ADDRESS}>`,
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
			{
				message:
					"教員アカウントへの変更申請が送信されました。管理者に承認されるまでお待ちください。",
			},
			200,
		);
	})
	.basePath("/profile")
	// 学生の所属登録
	.post(
		"/",
		requireRole("student", "admin"),
		zValidator("json", formSchema, (result, c) => {
			if (!result.success) {
				const firstError = result.error.issues[0]?.message;
				return c.json({ error: firstError }, 400);
			}
		}),
		async (c) => {
			const { userId } = c.get("session");
			const { grade, departmentName } = c.req.valid("json");
			const { status, ...body } = await registerStudentData(
				userId,
				departmentName,
				grade,
			);
			return c.json(body, status);
		},
	)
	// 学生のプロフィール情報取得
	.get("/", requireRole("student", "admin"), async (c) => {
		const { userId } = c.get("session");
		const result = await fetchStudentData(userId);
		if (!result) {
			return c.json({ error: "学生情報が見つかりません" }, 404);
		}
		return c.json(result, 200);
	});
