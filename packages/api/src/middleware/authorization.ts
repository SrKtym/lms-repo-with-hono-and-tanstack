import type { AuthVariables } from "@lms-repo/auth/server";
import {
	type CourseAccessLevel,
	fetchAssignmentAccess,
	fetchCourseAccess,
} from "@lms-repo/db/utils/query/helpers";
import { createMiddleware } from "hono/factory";

// ロールによる認可
export const requireRole = (...allowedRoles: string[]) =>
	createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
		const { role } = c.get("user");

		if (!role || !allowedRoles.includes(role)) {
			return c.json({ error: "not authorized" }, 403);
		}

		return next();
	});

interface CourseAccessOptions {
	allow?: CourseAccessLevel[];
	courseParam?: string;
}

// 講義リソースへのアクセス認可
export const requireCourseAccess = ({
	allow = ["professor", "student", "admin"],
	courseParam = "course-id",
}: CourseAccessOptions = {}) =>
	createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
		const courseId = c.req.param(courseParam);
		if (!courseId) {
			return c.json({ error: "courseID is required" }, 400);
		}

		const { userId } = c.get("session");
		const { role } = c.get("user");
		const access = await fetchCourseAccess(userId, courseId, {
			isAdmin: role === "admin",
		});

		if (!access) {
			return c.json({ error: "not found" }, 404);
		}

		if (!allow.includes(access.access)) {
			return c.json({ error: "not authorized" }, 403);
		}

		return next();
	});

interface AssignmentAccessOptions extends CourseAccessOptions {
	assignmentParam?: string;
}

// 課題リソースへのアクセス認可（講義へのアクセスと親子関係を検証）
export const requireAssignmentAccess = ({
	allow = ["professor", "student", "admin"],
	courseParam = "course-id",
	assignmentParam = "assignment-id",
}: AssignmentAccessOptions = {}) =>
	createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
		const courseId = c.req.param(courseParam);
		const assignmentId = c.req.param(assignmentParam);

		if (!courseId || !assignmentId) {
			return c.json({ error: "courseID and assignmentID are required" }, 400);
		}

		const { userId } = c.get("session");
		const { role } = c.get("user");
		const access = await fetchAssignmentAccess(userId, courseId, assignmentId, {
			isAdmin: role === "admin",
		});

		if (!access) {
			return c.json({ error: "not found" }, 404);
		}

		if (!allow.includes(access.access)) {
			return c.json({ error: "not authorized" }, 403);
		}

		return next();
	});
