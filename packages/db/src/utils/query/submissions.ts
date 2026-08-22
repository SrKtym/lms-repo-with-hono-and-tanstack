import { and, eq, sql } from "drizzle-orm";
import { db } from "../../index";
import {
	assignments,
	fileSubmissionsMetadata,
	submissionStatus,
	textSubmissions,
	user,
} from "../../schema";

// ユーザーが登録している講義の課題提出状況を取得
export async function fetchSubmissionsState(
	userId: string,
	assignmentId?: string,
) {
	const submissionsState = await db
		.select({
			status: submissionStatus.status,
			score: submissionStatus.score,
			assignmentTitle: assignments.title,
		})
		.from(submissionStatus)
		.innerJoin(assignments, eq(submissionStatus.assignmentId, assignments.id))
		.where(
			and(
				eq(submissionStatus.userId, userId),
				assignmentId
					? eq(submissionStatus.assignmentId, assignmentId)
					: undefined,
			),
		);

	return submissionsState;
}

export type FetchSubmissionsStateReturnType = Awaited<
	ReturnType<typeof fetchSubmissionsState>
>;

// ユーザーIDに基づいてファイルメタデータを取得（assignmentIdでフィルタリング可能）
export async function fetchFileMetadataByUserId(
	userId: string,
	assignmentId?: string,
) {
	const fileMetadata = await db
		.select({
			id: fileSubmissionsMetadata.id,
			assignmentId: fileSubmissionsMetadata.assignmentId,
			objectName: fileSubmissionsMetadata.objectName,
			originalName: fileSubmissionsMetadata.originalName,
			fileSize: fileSubmissionsMetadata.fileSize,
			mimeType: fileSubmissionsMetadata.mimeType,
		})
		.from(fileSubmissionsMetadata)
		.where(
			assignmentId
				? and(
						eq(fileSubmissionsMetadata.createdBy, userId),
						eq(fileSubmissionsMetadata.assignmentId, assignmentId),
					)
				: eq(fileSubmissionsMetadata.createdBy, userId),
		)
		.orderBy(fileSubmissionsMetadata.createdAt);

	return fileMetadata;
}

export type FetchFileMetadataByUserIdReturnType = Awaited<
	ReturnType<typeof fetchFileMetadataByUserId>
>;

// IDに基づいてファイルメタデータを取得（教員用）
export async function fetchFileMetadataById(fileId: string) {
	const [fileMetadata] = await db
		.select({
			id: fileSubmissionsMetadata.id,
			assignmentId: fileSubmissionsMetadata.assignmentId,
			objectName: fileSubmissionsMetadata.objectName,
			originalName: fileSubmissionsMetadata.originalName,
			fileSize: fileSubmissionsMetadata.fileSize,
			mimeType: fileSubmissionsMetadata.mimeType,
			createdBy: fileSubmissionsMetadata.createdBy,
		})
		.from(fileSubmissionsMetadata)
		.where(eq(fileSubmissionsMetadata.id, fileId))
		.limit(1);

	return fileMetadata;
}

export type FetchFileMetadataByIdReturnType = Awaited<
	ReturnType<typeof fetchFileMetadataById>
>;

// ユーザーIDに基づいてテキスト提出を取得（assignmentIdでフィルタリング可能）
export async function fetchTextSubmissionsByUserId(
	userId: string,
	assignmentId?: string,
) {
	const textSubmissionsData = await db
		.select({
			id: textSubmissions.id,
			assignmentId: textSubmissions.assignmentId,
			title: textSubmissions.title,
			description: textSubmissions.description,
			createdAt: textSubmissions.createdAt,
			updatedAt: textSubmissions.updatedAt,
		})
		.from(textSubmissions)
		.where(
			assignmentId
				? and(
						eq(textSubmissions.createdBy, userId),
						eq(textSubmissions.assignmentId, assignmentId),
					)
				: eq(textSubmissions.createdBy, userId),
		)
		.orderBy(textSubmissions.createdAt);

	return textSubmissionsData;
}

export type FetchTextSubmissionsByUserIdReturnType = Awaited<
	ReturnType<typeof fetchTextSubmissionsByUserId>
>;

// 指定された課題のすべての提出状況を取得（教員用、ページネーション対応）
export async function fetchAllSubmissionsWithStudents(
	assignmentId: string,
	limit = 10,
	offset = 0,
) {
	const submissions = await db
		.select({
			userId: submissionStatus.userId,
			assignmentId: submissionStatus.assignmentId,
			studentName: user.name,
			status: submissionStatus.status,
			points: assignments.points,
			score: submissionStatus.score,
			assignmentFormat: assignments.format,
			// テキスト提出物のデータ（データがない場合は空のオブジェクトを返す）
			textSubmission: sql<{
				id: string;
				title: string;
				description: string;
			}>`(
				COALESCE(
					(SELECT jsonb_build_object(
						'id', ${textSubmissions.id},
						'title', ${textSubmissions.title},
						'description', ${textSubmissions.description}
					)
					FROM ${textSubmissions}
					WHERE ${textSubmissions.assignmentId} = ${submissionStatus.assignmentId}
					AND ${textSubmissions.createdBy} = ${submissionStatus.userId}
					LIMIT 1),
					'{}'::jsonb
				)
			)`,
			// ファイル提出物のメタデータ（データがない場合は空の配列を返す）
			fileSubmission: sql<
				{
					id: string;
					objectName: string;
					originalName: string;
					mimeType: string;
					fileSize: number;
				}[]
			>`(
				COALESCE(
					(SELECT jsonb_agg(jsonb_build_object(
						'id', ${fileSubmissionsMetadata.id},
						'objectName', ${fileSubmissionsMetadata.objectName},
						'originalName', ${fileSubmissionsMetadata.originalName},
						'mimeType', ${fileSubmissionsMetadata.mimeType},
						'fileSize', ${fileSubmissionsMetadata.fileSize}
					))
					FROM ${fileSubmissionsMetadata}
					WHERE ${fileSubmissionsMetadata.assignmentId} = ${submissionStatus.assignmentId}
					AND ${fileSubmissionsMetadata.createdBy} = ${submissionStatus.userId}),
					'[]'::jsonb
				)
			)`,
		})
		.from(submissionStatus)
		.innerJoin(user, eq(submissionStatus.userId, user.id))
		.innerJoin(assignments, eq(submissionStatus.assignmentId, assignments.id))
		.where(eq(submissionStatus.assignmentId, assignmentId))
		.limit(limit)
		.offset(offset);

	return submissions;
}

export type FetchAllSubmissionsWithStudentsReturnType = Awaited<
	ReturnType<typeof fetchAllSubmissionsWithStudents>
>;
