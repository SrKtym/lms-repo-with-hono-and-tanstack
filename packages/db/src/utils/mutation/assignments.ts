import { and, eq } from "drizzle-orm";
import { db } from "../../index";
import {
	assignments,
	courses,
	emailNotificationSettings,
	notifications,
	registration,
	user,
	userNotifications,
} from "../../schema";
import type { Assignments } from "../../types";

// 課題の作成
export async function createAssignments(assignmentsData: Assignments) {
	try {
		const result = await db.transaction(async (tx) => {
			// 課題の作成と取得
			const [result] = await tx
				.insert(assignments)
				.values(assignmentsData)
				.returning({
					title: assignments.title,
					description: assignments.description,
					points: assignments.points,
					dueDate: assignments.dueDate,
					format: assignments.format,
					courseId: assignments.courseId,
				})
				.onConflictDoNothing();

			const courseId = result?.courseId;

			if (!courseId) {
				return { message: "講義が見つかりません", status: 404 };
			}

			// 講義名と受講者IDを取得
			const courseData = await tx
				.select({
					name: courses.name,
					studentId: registration.userId,
				})
				.from(courses)
				.innerJoin(registration, eq(courses.id, registration.courseId))
				.where(eq(courses.id, courseId));

			// 通知データ
			const notificationsData = {
				title: `${courseData[0]?.name}に新しい課題: ${result.title}`,
				description: `提出形式: ${result.format}\n説明: ${result.description}`,
				type: "assignment",
			};

			// 通知の作成
			const [data] = await tx
				.insert(notifications)
				.values(notificationsData)
				.returning({
					id: notifications.id,
				})
				.onConflictDoNothing();

			if (data) {
				const userNotificationData = courseData.map((course) => ({
					userId: course.studentId,
					notificationId: data.id,
				}));
				await tx
					.insert(userNotifications)
					.values(userNotificationData)
					.onConflictDoNothing();
			}

			// メール通知を有効にしているユーザーのメール一覧
			const res = await tx
				.select({
					email: user.email,
				})
				.from(user)
				.innerJoin(
					emailNotificationSettings,
					eq(user.id, emailNotificationSettings.userId),
				)
				.innerJoin(
					registration,
					eq(emailNotificationSettings.userId, registration.userId),
				)
				.where(
					and(
						eq(registration.courseId, courseId),
						eq(emailNotificationSettings.assignmentsEmail, true),
					),
				);

			const emails = res.map(({ email }) => email);

			const { courseId: _, ...rest } = result;

			const merged = { ...rest, emails };

			return merged;
		});
		return result;
	} catch {
		return { message: "課題の作成に失敗しました。", status: 500 };
	}
}

// 課題の更新
export async function updateAssignments(assignmentsData: Assignments) {
	try {
		await db.update(assignments).set(assignmentsData);
		return { message: "課題の更新に成功しました。", status: 200 };
	} catch {
		return { message: "課題の更新に失敗しました。", status: 500 };
	}
}

// 課題の削除
export async function deleteAssignments(assignmentId: string) {
	try {
		await db.delete(assignments).where(eq(assignments.id, assignmentId));
		return { message: "課題の削除に成功しました。", status: 200 };
	} catch {
		return { message: "課題の削除に失敗しました。", status: 500 };
	}
}
