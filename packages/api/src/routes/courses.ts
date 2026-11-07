import { zValidator } from "@hono/zod-validator";
import type { Session } from "@lms-repo/auth/server";
import type { Courses, CoursesOptional } from "@lms-repo/db/types";
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
import { Hono } from "hono";
import { z } from "zod";

// 講義に関するロジック（学生用）
export const coursesRouteForStudent = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	// 講義検索
	.get("/", async (c) => {
		const { userId } = c.get("session");
		const { weekdays, period, limit, offset } = c.req.query();
		if (!weekdays || !period) {
			return c.json([], 200);
		}

		const result = await fetchCourses(
			userId,
			Number(weekdays),
			Number(period),
			Number(limit),
			Number(offset),
		);
		return c.json(result, 200);
	})
	// 修了した講義の単位数の合計を取得
	.get("/completed-credits", async (c) => {
		const { userId } = c.get("session");
		const result = await fetchCompletedCourses(userId);
		return c.json(result, 200);
	})
	.basePath("/registrations")
	// 講義登録
	.post("/:course-id", async (c) => {
		const { userId } = c.get("session");
		const { "course-id": courseId } = c.req.param();
		const { status, ...body } = await registerCourses(courseId, userId);
		return c.json(body, status);
	})
	// 登録講義一覧取得
	.get("/", async (c) => {
		const { userId } = c.get("session");
		const result = await fetchRegisteredCourses(userId);
		return c.json(result, 200);
	})
	// 登録講義の確定
	.patch("/confirm", async (c) => {
		const { userId } = c.get("session");
		const { status, ...body } = await checkCourse(userId);
		return c.json(body, status);
	})
	// 登録講義削除
	.delete("/:course-id", async (c) => {
		const { userId } = c.get("session");
		const { "course-id": courseId } = c.req.param();
		const { status, ...body } = await unregisterCourse(courseId, userId);
		return c.json(body, status);
	});

// 講義に関するロジック（教員用）
export const coursesRouteForProf = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>() // 講義作成
	.post(
		"/",
		zValidator("json", z.custom<Omit<Courses, CoursesOptional>>()),
		async (c) => {
			const { userId } = c.get("session");
			const courseData = c.req.valid("json");
			const department = await fetchProfData(userId);

			if (!department) {
				return c.json({ error: "学科が見つかりません" }, 404);
			}

			const { status, ...body } = await createCourses({
				...courseData,
				departmentId: department.departmentId,
				professorId: userId,
			});
			return c.json(body, status);
		},
	)
	// 作成した講義を取得
	.get("/", async (c) => {
		const { userId } = c.get("session");
		const result = await fetchCreatedCourses(userId);
		return c.json(result, 200);
	});

// 講義に関連するロジック（共通用）
export const coursesRouteForCommon = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	// 講義を登録しているメンバーの取得
	.get("/:courseId", async (c) => {
		const { courseId } = c.req.param();
		const result = await fetchMembersByCourseId(courseId);
		return c.json(result, 200);
	});
