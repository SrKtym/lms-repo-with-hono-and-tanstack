import { zValidator } from "@hono/zod-validator";
import type { AuthVariables } from "@lms-repo/auth/server";
import {
	checkCourse,
	createCourses,
	registerCourses,
	unregisterCourse,
} from "@lms-repo/db/utils/mutation/courses";
import {
	fetchCompletedCourses,
	fetchCourses,
	fetchCreatedCourses,
	fetchRegisteredCourses,
} from "@lms-repo/db/utils/query/courses";
import { fetchProfData } from "@lms-repo/db/utils/query/professors";
import { fetchMembersByCourseId } from "@lms-repo/db/utils/query/students";
import { DAYS_EXCEPT_WEEKEND } from "@lms-repo/shared/utils";
import { Hono } from "hono";
import { requireCourseAccess, requireRole } from "../middleware/authorization";
import { courseSearchQuerySchema, formSchema } from "../schema/courses";
import { announcementsRoute } from "./announcements";
import { assignmentsRoute } from "./assignments";

// 講義に関するロジック
export const coursesRoute = new Hono<{ Variables: AuthVariables }>()
	// 講義作成
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
			const courseData = c.req.valid("json");
			const department = await fetchProfData(userId);

			if (!department) {
				return c.json({ error: "学科が見つかりません" }, 404);
			}

			// 曜日と数字のマッピング
			const daysMap: Record<string, number> = Object.fromEntries(
				DAYS_EXCEPT_WEEKEND.map((day, i) => [day, i + 1]),
			);

			const weekdays = daysMap[courseData.weekdays];

			if (!weekdays) {
				return c.json({ error: "曜日が正しくありません" }, 400);
			}

			const transformedValue = {
				...courseData,
				weekdays,
			};

			const { status, ...body } = await createCourses({
				...transformedValue,
				departmentId: department.departmentId,
				professorId: userId,
			});
			return c.json(body, status);
		},
	)
	// 作成した講義を取得
	.get("/creations", requireRole("professor", "admin"), async (c) => {
		const { userId } = c.get("session");
		const result = await fetchCreatedCourses(userId);
		return c.json(result, 200);
	})
	// 講義検索
	.get(
		"/",
		requireRole("student", "admin"),
		zValidator("query", courseSearchQuerySchema),
		async (c) => {
			const { userId } = c.get("session");
			const { weekdays, period, limit, offset } = c.req.valid("query");

			const result = await fetchCourses(
				userId,
				weekdays,
				period,
				limit,
				offset,
			);
			return c.json(result, 200);
		},
	)
	// 講義を登録しているメンバーの取得
	.get("/:course-id/members", requireCourseAccess(), async (c) => {
		const { "course-id": courseId } = c.req.param();
		const result = await fetchMembersByCourseId(courseId);
		return c.json(result, 200);
	})
	// 修了した講義の単位数の合計を取得
	.get("/completed-credits", requireRole("student", "admin"), async (c) => {
		const { userId } = c.get("session");
		const result = await fetchCompletedCourses(userId);
		return c.json(result, 200);
	})
	// 講義登録
	.post("/:course-id/register", requireRole("student", "admin"), async (c) => {
		const { userId } = c.get("session");
		const { "course-id": courseId } = c.req.param();
		const { status, ...body } = await registerCourses(courseId, userId);
		return c.json(body, status);
	})
	// 登録講義の解除
	.delete(
		"/:course-id/unregister",
		requireRole("student", "admin"),
		async (c) => {
			const { userId } = c.get("session");
			const { "course-id": courseId } = c.req.param();
			const { status, ...body } = await unregisterCourse(courseId, userId);
			return c.json(body, status);
		},
	)
	.route("/", announcementsRoute)
	.route("/", assignmentsRoute)
	.basePath("/registrations")
	// 登録講義一覧取得
	.get("/", requireRole("student", "admin"), async (c) => {
		const { userId } = c.get("session");
		const result = await fetchRegisteredCourses(userId);
		return c.json(result, 200);
	})
	// 登録講義の確定
	.patch("/confirm", requireRole("student", "admin"), async (c) => {
		const { userId } = c.get("session");
		const { status, ...body } = await checkCourse(userId);
		return c.json(body, status);
	});
