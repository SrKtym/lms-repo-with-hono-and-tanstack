import { and, eq } from "drizzle-orm";
import type { db } from "../../index";
import {
	courses,
	emailNotificationSettings,
	notifications,
	registration,
	user,
	userNotifications,
} from "../../schema";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

interface CourseData {
	name: string;
	studentId: string;
}

interface NotificationData {
	title: string;
	description: string;
	type: string;
}

/**
 * コースデータ（講義名と受講者ID）を取得
 */
export async function fetchCourseData(tx: Transaction, courseId: string) {
	const [data] = await tx
		.select({
			name: courses.name,
			studentId: registration.userId,
		})
		.from(courses)
		.innerJoin(registration, eq(courses.id, registration.courseId))
		.where(eq(courses.id, courseId))
		.limit(1);

	return data;
}

/**
 * 通知を作成し、ユーザー通知を登録（複数ユーザー向け）
 */
export async function createNotification(
	tx: Transaction,
	notificationsData: NotificationData,
	courseData: CourseData[],
) {
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

	return data;
}

/**
 * 通知を作成し、ユーザー通知を登録（単一ユーザー向け）
 */
export async function createNotificationForUser(
	tx: Transaction,
	notificationsData: NotificationData,
	userId: string,
) {
	const [data] = await tx
		.insert(notifications)
		.values(notificationsData)
		.returning({
			id: notifications.id,
		})
		.onConflictDoNothing();

	if (data) {
		await tx
			.insert(userNotifications)
			.values({
				userId,
				notificationId: data.id,
			})
			.onConflictDoNothing();
	}

	return data;
}

/**
 * メール通知を有効にしているユーザーのメール一覧を取得
 */
export async function fetchEmailsForNotification(
	tx: Transaction,
	courseId: string,
	emailField: "assignmentsEmail" | "announcementsEmail",
) {
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
				eq(emailNotificationSettings[emailField], true),
			),
		);

	const emails = res.map(({ email }: { email: string }) => email);
	return emails;
}
