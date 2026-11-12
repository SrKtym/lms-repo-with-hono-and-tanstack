import { EDIT_PERIOD_DAYS } from "@lms-repo/shared/utils";
import { and, eq } from "drizzle-orm";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { db } from "../../index";
import {
	courses,
	emailNotificationSettings,
	fileSubmissionsMetadata,
	notifications,
	registration,
	submissionStatus,
	textSubmissions,
	user,
	userNotifications,
} from "../../schema";
import type { Notifications, NotificationsOptional } from "../../types";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

interface CourseData {
	name: string;
	studentId: string;
}

// レスポンスヘルパー
export function ok<S extends ContentfulStatusCode>(message: string, status: S) {
	return { message, status };
}

export function fail<S extends ContentfulStatusCode>(error: string, status: S) {
	return { error, status };
}

export function warn<S extends ContentfulStatusCode>(
	message: string,
	warning: string,
	status: S,
) {
	return {
		message,
		warning,
		status,
	};
}

// 履修登録について編集期限内かチェック
export async function isWithinEditPeriod(tx: Transaction, userId: string) {
	const [userInfo] = await tx
		.select({
			createdAt: user.createdAt,
		})
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);

	if (!userInfo) {
		return false;
	}

	const now = new Date();
	const daysSinceCreation = Math.floor(
		(now.getTime() - userInfo.createdAt.getTime()) / (1000 * 60 * 60 * 24),
	);

	return daysSinceCreation <= EDIT_PERIOD_DAYS;
}

// コースデータ（講義名と受講者ID）を取得
export async function fetchCourseData(tx: Transaction, courseId: string) {
	const data = await tx
		.select({
			name: courses.name,
			studentId: registration.userId,
		})
		.from(courses)
		.innerJoin(registration, eq(courses.id, registration.courseId))
		.where(eq(courses.id, courseId));

	return data;
}

// 通知を作成し、ユーザー通知を登録（複数ユーザー向け）
export async function createNotification(
	tx: Transaction,
	notificationsData: Omit<Notifications, NotificationsOptional>,
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

// 通知を作成し、ユーザー通知を登録（単一ユーザー向け）
export async function createNotificationForUser(
	tx: Transaction,
	notificationsData: Omit<Notifications, NotificationsOptional>,
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

// メール通知を有効にしているユーザーのメール一覧を取得
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

/**
 * 削除後にテキストまたはファイルの提出物が残っているか確認し、
 * どちらも存在しない場合はステータスを「未提出」に同期する
 */
export async function syncSubmissionStatusAfterDeletion(
	tx: Transaction,
	userId: string,
	assignmentId: string,
) {
	// 1. テキスト提出が残っているか（limit 1 で即時判定）
	const [hasText] = await tx
		.select({ id: textSubmissions.id })
		.from(textSubmissions)
		.where(
			and(
				eq(textSubmissions.createdBy, userId),
				eq(textSubmissions.assignmentId, assignmentId),
			),
		)
		.limit(1);

	if (hasText) {
		return;
	}

	// 2. ファイル提出が残っているか（limit 1 で即時判定）
	const [hasFile] = await tx
		.select({ id: fileSubmissionsMetadata.id })
		.from(fileSubmissionsMetadata)
		.where(
			and(
				eq(fileSubmissionsMetadata.createdBy, userId),
				eq(fileSubmissionsMetadata.assignmentId, assignmentId),
			),
		)
		.limit(1);

	if (hasFile) {
		return;
	}

	// 3. 両方とも存在しない場合は「未提出」に更新
	await tx
		.update(submissionStatus)
		.set({ status: "未提出" })
		.where(
			and(
				eq(submissionStatus.userId, userId),
				eq(submissionStatus.assignmentId, assignmentId),
			),
		);
}
