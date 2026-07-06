import { and, eq } from "drizzle-orm";
import { db } from "../../index";
import {
	assignments,
	fileSubmissionsMetadata,
	registration,
	submissionStatus,
} from "../../schema";

// ユーザーが登録している講義の課題提出状況を取得
export async function fetchSubmissionsFromUserCourses(userId: string) {
	const submissionList = await db
		.select({
			status: submissionStatus.status,
			score: submissionStatus.score,
			assignmentTitle: assignments.title,
		})
		.from(submissionStatus)
		.innerJoin(assignments, eq(submissionStatus.assignmentId, assignments.id))
		.innerJoin(registration, eq(assignments.courseId, registration.courseId))
		.where(eq(registration.userId, userId));

	return submissionList;
}

export type FetchSubmissionsFromUserCoursesReturnType = Awaited<
	ReturnType<typeof fetchSubmissionsFromUserCourses>
>;

// ユーザーが登録している講義の特定の課題の提出状況を取得
export async function fetchSubmissionById(
	userId: string,
	assignmentId: string,
) {
	const [submission] = await db
		.select({
			status: submissionStatus.status,
			score: submissionStatus.score,
			assignmentTitle: assignments.title,
		})
		.from(submissionStatus)
		.innerJoin(assignments, eq(submissionStatus.assignmentId, assignments.id))
		.innerJoin(registration, eq(assignments.courseId, registration.courseId))
		.where(
			and(eq(registration.userId, userId), eq(assignments.id, assignmentId)),
		)
		.limit(1);

	return submission;
}

export type FetchSubmissionByIdReturnType = Awaited<
	ReturnType<typeof fetchSubmissionById>
>;

// ユーザーIDに基づいてファイルメタデータを取得
export async function fetchFileMetadataByUserId(userId: string) {
	const fileMetadata = await db
		.select({
			id: fileSubmissionsMetadata.id,
			objectName: fileSubmissionsMetadata.objectName,
			originalName: fileSubmissionsMetadata.originalName,
			fileSize: fileSubmissionsMetadata.fileSize,
			mimeType: fileSubmissionsMetadata.mimeType,
		})
		.from(fileSubmissionsMetadata)
		.where(eq(fileSubmissionsMetadata.createdBy, userId))
		.orderBy(fileSubmissionsMetadata.createdAt);

	return fileMetadata;
}

export type FetchFileMetadataByUserIdReturnType = Awaited<
	ReturnType<typeof fetchFileMetadataByUserId>
>;
