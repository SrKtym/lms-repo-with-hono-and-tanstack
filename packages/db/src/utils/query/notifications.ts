import { and, desc, eq, inArray, or } from "drizzle-orm";
import { db } from "../../index";
import {
	courses,
	departments,
	faculties,
	notifications,
	registration,
} from "../../schema";

// 通知の基本条件を生成（サブクエリを使用）
function getBaseConditions(userId: string) {
	return [
		// 受信者がstudentsであるか
		eq(notifications.receiver, "students"),
		// 受信者が登録している講義であるか
		inArray(
			notifications.receiver,
			db
				.select({ id: courses.id })
				.from(courses)
				.innerJoin(registration, eq(courses.id, registration.courseId))
				.where(eq(registration.userId, userId)),
		),
		// 受信者が所属している学科であるか
		inArray(
			notifications.receiver,
			db
				.select({ id: departments.id })
				.from(departments)
				.innerJoin(courses, eq(departments.id, courses.departmentId))
				.innerJoin(registration, eq(courses.id, registration.courseId))
				.where(eq(registration.userId, userId)),
		),
		// 受信者が所属している学部であるか
		inArray(
			notifications.receiver,
			db
				.select({ id: faculties.id })
				.from(faculties)
				.innerJoin(departments, eq(faculties.id, departments.facultyId))
				.innerJoin(courses, eq(departments.id, courses.departmentId))
				.innerJoin(registration, eq(courses.id, registration.courseId))
				.where(eq(registration.userId, userId)),
		),
	];
}

// 通知の総数を取得(サブクエリを使用)
export async function fetchNotificationsCount(
	userId: string,
	filter?: "all" | "unread" | "read",
) {
	const baseConditions = getBaseConditions(userId);

	let conditions = baseConditions;

	// フィルタオプションに基づいて既読/未読の条件を追加
	if (filter === "unread") {
		conditions = [...baseConditions, eq(notifications.isRead, false)];
	} else if (filter === "read") {
		conditions = [...baseConditions, eq(notifications.isRead, true)];
	}

	const count = await db
		.select({ count: notifications.id })
		.from(notifications)
		.where(
			// baseConditionsはORで結合（いずれかの階層に一致すればOK）
			// 追加のフィルタ条件はANDで結合
			and(or(...baseConditions), ...conditions.slice(baseConditions.length)),
		);

	return count.length;
}

// 通知の取得（サブクエリを使用）
export async function fetchNotifications(
	userId: string,
	limit = 10,
	offset = 0,
) {
	const baseConditions = getBaseConditions(userId);

	const notificationList = await db
		.select()
		.from(notifications)
		.where(or(...baseConditions))
		.orderBy(desc(notifications.createdAt))
		.limit(limit)
		.offset(offset);

	return notificationList;
}

export type FetchNotificationsReturnType = Awaited<
	ReturnType<typeof fetchNotifications>
>;
