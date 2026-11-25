import { Storage } from "@google-cloud/storage";
import { zValidator } from "@hono/zod-validator";
import type { AuthVariables } from "@lms-repo/auth/server";

import {
	deleteFileAndSyncStatus,
	deleteTextAndSyncStatus,
	submitFilesWithStatus,
	submitTextWithStatus,
	updateSubmissionScore,
} from "@lms-repo/db/utils/mutation/submissions";
import { fetchAssignmentPointsById } from "@lms-repo/db/utils/query/assignments";
import {
	fetchAssignmentAccess,
	fetchCourseAccess,
} from "@lms-repo/db/utils/query/helpers";
import {
	type FetchFileMetadataByIdReturnType,
	type FetchFileMetadataByUserIdReturnType,
	fetchAllSubmissionsWithStudents,
	fetchFileMetadataById,
	fetchFileMetadataByUserId,
	fetchSubmissionsState,
	fetchTextSubmissionsByUserId,
} from "@lms-repo/db/utils/query/submissions";
import { env } from "@lms-repo/env/server";
import { Hono } from "hono";
import { z } from "zod";
import { requireAssignmentAccess } from "../middleware/authorization";
import {
	createMetadataSchema,
	metadataSchema,
	signedUrlSchema,
	textSubmissionsSchema,
	uploadFormSchema,
} from "../schema/submissions";

const storage = new Storage({
	// エミュレータ環境の場合のみAPIエンドポイントを設定
	...(env.GCS_EMULATOR_HOST && {
		apiEndpoint: env.GCS_EMULATOR_HOST,
		projectId: "dummy-project",
		credentials: {
			client_email: "dummy@example.com",
			private_key:
				"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7WJT1m8tY4z\n-----END PRIVATE KEY-----",
		},
	}),
});

const bucket = storage.bucket(env.GCS_BUCKET_NAME);

type FileMetadata =
	| FetchFileMetadataByIdReturnType
	| FetchFileMetadataByUserIdReturnType[number];

// エミュレータ環境でバケットが存在しない場合は作成
async function ensureBucketExists() {
	if (env.GCS_EMULATOR_HOST) {
		const [exists] = await bucket.exists();
		if (!exists) {
			await bucket.create();
			console.log(`Bucket ${env.GCS_BUCKET_NAME} created`);
		}
	}
}

// 提出に関するロジック
export const submissionsRoute = new Hono<{ Variables: AuthVariables }>()
	.basePath("/:assignment-id/submissions")
	// ファイルアップロード用署名付きURLの一括発行
	.post(
		"/signed-urls",
		requireAssignmentAccess({ allow: ["student"] }),
		zValidator("json", signedUrlSchema, (result, c) => {
			if (!result.success) {
				const firstError = result.error.issues[0]?.message;
				return c.json({ error: firstError }, 400);
			}
		}),
		async (c) => {
			const { userId } = c.get("session");
			const courseId = c.req.param("course-id");
			const assignmentId = c.req.param("assignment-id");
			const files = c.req.valid("json");

			if (!courseId || !assignmentId) {
				return c.json({ error: "courseID and assignmentID are required" }, 400);
			}

			// バケットが存在することを確認
			await ensureBucketExists();

			// ファイル名をランダムなUUIDに変換して署名付きURLを生成
			const signedUrls = await Promise.all(
				files.map(async ({ fileName, fileType }) => {
					const objectName = `submissions/course-id:${courseId}/assignment-id:${assignmentId}/user-id:${userId}/${crypto.randomUUID()}`;
					let signedUrl: string;

					// エミュレータ環境では署名なしURLを使用
					if (env.GCS_EMULATOR_HOST) {
						signedUrl = `${env.GCS_EMULATOR_HOST}/${env.GCS_BUCKET_NAME}/${objectName}`;
					} else {
						// 本番環境では署名付きURLを使用
						[signedUrl] = await bucket.file(objectName).getSignedUrl({
							version: "v4",
							action: "write",
							expires: Date.now() + 15 * 60 * 1000,
							contentType: fileType,
						});
					}

					return {
						fileName,
						signedUrl,
						objectName,
					};
				}),
			);

			return c.json(signedUrls, 200);
		},
	)
	// ファイルメタデータの取得
	.get("/files", requireAssignmentAccess({ allow: ["student"] }), async (c) => {
		const { userId } = c.get("session");
		const { "assignment-id": assignmentId } = c.req.param();

		const fileMetadata = await fetchFileMetadataByUserId(userId, assignmentId);
		return c.json(fileMetadata, 200);
	})
	// テキスト提出物の取得
	.get("/text", requireAssignmentAccess({ allow: ["student"] }), async (c) => {
		const { userId } = c.get("session");
		const { "assignment-id": assignmentId } = c.req.param();

		const textSubmissionsData = await fetchTextSubmissionsByUserId(
			userId,
			assignmentId,
		);
		return c.json(textSubmissionsData, 200);
	})
	// ファイルダウンロード用署名付きURLの発行
	.get("/files/:id/download", async (c) => {
		const { userId } = c.get("session");
		const { role } = c.get("user");
		const courseId = c.req.param("course-id");
		const assignmentId = c.req.param("assignment-id");
		const id = c.req.param("id");

		if (!courseId || !assignmentId || !id) {
			return c.json(
				{ error: "courseID, assignmentID and fileID are required" },
				400,
			);
		}

		const access = await fetchAssignmentAccess(userId, courseId, assignmentId, {
			isAdmin: role === "admin",
		});

		if (!access) {
			return c.json({ error: "not found" }, 404);
		}

		let file: FileMetadata;

		if (access.access === "professor" || access.access === "admin") {
			file = await fetchFileMetadataById(id);
		} else {
			const fileMetadata = await fetchFileMetadataByUserId(
				userId,
				assignmentId,
			);
			file = fileMetadata?.find((f) => f.id === id);
		}

		if (!file || file.assignmentId !== assignmentId) {
			return c.json({ error: "ファイルが見つかりません" }, 404);
		}

		// エミュレータ環境ではプロキシURLを返す
		if (env.GCS_EMULATOR_HOST) {
			return c.json(
				{
					signedUrl: `/api/courses/${courseId}/assignments/${assignmentId}/submissions/files/${id}/proxy`,
					fileName: file.originalName,
				},
				200,
			);
		}

		// 本番環境では署名付きURLを返す
		const [signedUrl] = await bucket.file(file.objectName).getSignedUrl({
			version: "v4",
			action: "read",
			expires: Date.now() + 15 * 60 * 1000, // 15分有効
		});

		return c.json({ signedUrl, fileName: file.originalName }, 200);
	})
	// ファイルダウンロードプロキシ（エミュレータ環境用）
	.get("/files/:id/proxy", async (c) => {
		const { userId } = c.get("session");
		const { role } = c.get("user");
		const courseId = c.req.param("course-id");
		const assignmentId = c.req.param("assignment-id");
		const id = c.req.param("id");

		if (!courseId || !assignmentId || !id) {
			return c.json(
				{ error: "courseID, assignmentID and fileID are required" },
				400,
			);
		}

		const access = await fetchAssignmentAccess(userId, courseId, assignmentId, {
			isAdmin: role === "admin",
		});

		if (!access) {
			return c.json({ error: "not found" }, 404);
		}

		let file: FileMetadata;

		if (access.access === "professor" || access.access === "admin") {
			file = await fetchFileMetadataById(id);
		} else {
			const fileMetadata = await fetchFileMetadataByUserId(
				userId,
				assignmentId,
			);
			file = fileMetadata?.find((f) => f.id === id);
		}

		if (!file || file.assignmentId !== assignmentId) {
			return c.json({ error: "ファイルが見つかりません" }, 404);
		}

		// GCSからファイルを取得
		const [fileData] = await bucket.file(file.objectName).download();

		return c.newResponse(new Uint8Array(fileData), 200, {
			"Content-Type": file.mimeType,
			"Content-Disposition": `attachment; filename="${file.originalName}"`,
		});
	})
	// ファイルアップロード（エミュレータ環境用）
	.post(
		"/upload",
		requireAssignmentAccess({ allow: ["student"] }),
		zValidator("form", uploadFormSchema, (result, c) => {
			if (!result.success) {
				const firstError = result.error.issues[0]?.message;
				return c.json({ error: firstError }, 400);
			}
		}),
		async (c) => {
			const { userId } = c.get("session");
			const courseId = c.req.param("course-id");
			const assignmentId = c.req.param("assignment-id");
			const { files } = c.req.valid("form");

			if (!courseId || !assignmentId) {
				return c.json({ error: "courseID and assignmentID are required" }, 400);
			}

			// 単一ファイルでも配列に正規化
			const fileList = Array.isArray(files) ? files : [files];

			// バケットが存在することを確認
			await ensureBucketExists();

			// エミュレータ環境のストレージに並列でアップロード
			const uploadedMetadata = await Promise.all(
				fileList.map(async (file) => {
					const fileName = file.name;
					const objectName = `submissions/course-id:${courseId}/assignment-id:${assignmentId}/user-id:${userId}/${crypto.randomUUID()}`;
					const fileObject = bucket.file(objectName);
					const buffer = Buffer.from(await file.arrayBuffer());
					await fileObject.save(buffer, {
						contentType: file.type,
					});
					return {
						objectName,
						originalName: fileName,
						mimeType: file.type,
						fileSize: file.size,
					};
				}),
			);
			// メタデータの配列を返す
			return c.json(uploadedMetadata, 200);
		},
	)
	// ファイルメタデータの一括保存（複数ファイルアップロード用）
	.post(
		"/files",
		requireAssignmentAccess({ allow: ["student"] }),
		zValidator("json", metadataSchema, (result, c) => {
			if (!result.success) {
				const firstError = result.error.issues[0]?.message;
				return c.json({ error: firstError }, 400);
			}
		}),
		async (c) => {
			const { userId } = c.get("session");
			const courseId = c.req.param("course-id");
			const { "assignment-id": assignmentId } = c.req.param();
			const { metadataList } = c.req.valid("json");

			if (!courseId || !assignmentId) {
				return c.json({ error: "courseID and assignmentID are required" }, 400);
			}

			const objectNamePrefix = `submissions/course-id:${courseId}/assignment-id:${assignmentId}/user-id:${userId}/`;
			const parsed = createMetadataSchema(objectNamePrefix).safeParse({
				metadataList,
			});

			if (!parsed.success) {
				const firstError = parsed.error.issues[0]?.message;
				return c.json({ error: firstError }, 400);
			}

			// トランザクション処理（メタデータ登録 + ステータス更新）
			const result = await submitFilesWithStatus(
				assignmentId,
				userId,
				env.GCS_BUCKET_NAME,
				parsed.data.metadataList,
			);

			if ("error" in result) {
				const { status, ...body } = result;
				return c.json(body, status);
			}

			return c.json(result, 200);
		},
	)
	// 課題の提出（テキスト形式）
	.post(
		"/text",
		requireAssignmentAccess({ allow: ["student"] }),
		zValidator("json", textSubmissionsSchema, (result, c) => {
			if (!result.success) {
				const firstError = result.error.issues[0]?.message;
				return c.json({ error: firstError }, 400);
			}
		}),
		async (c) => {
			const { userId } = c.get("session");
			const { "assignment-id": assignmentId } = c.req.param();
			const req = c.req.valid("json");

			const merged = { createdBy: userId, assignmentId, ...req };

			// トランザクション処理（テキスト提出 + ステータス更新）
			const { status, ...body } = await submitTextWithStatus(merged);

			return c.json(body, status);
		},
	)
	// 特定の課題の提出状況の取得
	.get(
		"/status",
		requireAssignmentAccess({ allow: ["student"] }),
		async (c) => {
			const { userId } = c.get("session");
			const { "assignment-id": assignmentId } = c.req.param();
			const submissions = await fetchSubmissionsState(userId, assignmentId);
			return c.json(submissions, 200);
		},
	)
	// ファイルの削除
	.delete(
		"/files/:id",
		requireAssignmentAccess({ allow: ["student"] }),
		async (c) => {
			const { userId } = c.get("session");
			const { "assignment-id": assignmentId } = c.req.param();
			const id = c.req.param("id");

			// メタデータを取得してobjectNameを確認
			const fileMetadata = await fetchFileMetadataByUserId(
				userId,
				assignmentId,
			);
			const file = fileMetadata?.find((f) => f.id === id);

			if (!file || file.assignmentId !== assignmentId) {
				return c.json({ error: "ファイルが見つかりません" }, 404);
			}

			// GCSからファイルを削除
			try {
				await bucket.file(file.objectName).delete();
			} catch (error) {
				console.error("GCSファイル削除エラー:", error);
				// GCS削除に失敗してもDB削除は続行
			}

			const { status, ...body } = await deleteFileAndSyncStatus(
				file.id,
				userId,
				file.assignmentId,
			);

			return c.json(body, status);
		},
	)
	// テキスト提出物の削除
	.delete(
		"/text/:id",
		requireAssignmentAccess({ allow: ["student"] }),
		async (c) => {
			const { userId } = c.get("session");
			const { "assignment-id": assignmentId } = c.req.param();
			const id = c.req.param("id");

			// ユーザーが所有するテキスト提出物か確認
			const textSubmissionsData = await fetchTextSubmissionsByUserId(
				userId,
				assignmentId,
			);
			const submission = textSubmissionsData?.find((s) => s.id === id);

			if (!submission || submission.assignmentId !== assignmentId) {
				return c.json({ error: "テキスト提出物が見つかりません" }, 404);
			}

			const { status, ...body } = await deleteTextAndSyncStatus(
				submission.id,
				userId,
				submission.assignmentId,
			);

			return c.json(body, 200);
		},
	)
	// 採点（教員用）
	.post(
		"/grade",
		requireAssignmentAccess({ allow: ["professor", "admin"] }),
		zValidator(
			"json",
			z.object({
				userId: z.uuidv4(),
				score: z.number().int().min(0, "点数は0以上の整数でなければなりません"),
			}),
			(result, c) => {
				if (!result.success) {
					const firstError = result.error.issues[0]?.message;
					return c.json({ error: firstError }, 400);
				}
			},
		),
		async (c) => {
			const courseId = c.req.param("course-id");
			const assignmentId = c.req.param("assignment-id");
			const { userId, score } = c.req.valid("json");

			if (!courseId || !assignmentId) {
				return c.json({ error: "courseID and assignmentID are required" }, 400);
			}

			const assignmentPoints = await fetchAssignmentPointsById(assignmentId);

			if (!assignmentPoints) {
				return c.json({ error: "課題が見つかりません" }, 404);
			}

			const targetAccess = await fetchCourseAccess(userId, courseId);

			if (targetAccess?.access !== "student") {
				return c.json({ error: "対象の学生が見つかりません" }, 404);
			}

			if (score > assignmentPoints) {
				return c.json({ error: "点数が課題の配点を超えています" }, 400);
			}

			const { status, ...body } = await updateSubmissionScore(
				assignmentId,
				userId,
				score,
			);

			return c.json(body, status);
		},
	)
	// 指定された課題のすべての提出物を取得（教員用、無限スクロールに対応）
	.get(
		"/",
		requireAssignmentAccess({ allow: ["professor", "admin"] }),
		zValidator(
			"query",
			z.object({
				limit: z.coerce.number(),
				offset: z.coerce.number(),
			}),
		),
		async (c) => {
			const { "assignment-id": assignmentId } = c.req.param();
			const { limit, offset } = c.req.valid("query");

			const submissions = await fetchAllSubmissionsWithStudents(
				assignmentId,
				limit,
				offset,
			);
			return c.json(submissions, 200);
		},
	);
