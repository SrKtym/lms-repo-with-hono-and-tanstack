import { zValidator } from "@hono/zod-validator";
import type { AuthVariables } from "@lms-repo/auth/server";
import { registerProfData } from "@lms-repo/db/utils/mutation/professors";
import { fetchProfData } from "@lms-repo/db/utils/query/professors";
import { Hono } from "hono";
import { requireRole } from "../middleware/authorization";
import { formSchema } from "../schema/professors";

export const professorsRoute = new Hono<{ Variables: AuthVariables }>()
	.basePath("/me/profile")
	// 教授の所属登録
	.post(
		"/",
		requireRole("professor", "admin"),
		zValidator("json", formSchema, (result, c) => {
			if (!result.success) {
				const firstError = result.error.issues[0]?.message;
				return c.json({ error: firstError }, 400);
			}
		}),
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
	.get("/", requireRole("professor", "admin"), async (c) => {
		const { userId } = c.get("session");
		const result = await fetchProfData(userId);

		if (!result) {
			return c.json({ error: "プロフィール情報が見つかりませんでした" }, 404);
		}
		return c.json(result, 200);
	});
