import { Storage } from "@google-cloud/storage";
import { zValidator } from "@hono/zod-validator";
import type { Session } from "@lms-repo/auth/server";
import { db } from "@lms-repo/db";
import { submissionStatus } from "@lms-repo/db/schema/service";
import type { TextSubmissions } from "@lms-repo/db/types";
import {
	createFileSubmissionMetadata,
	createTextSubmission,
} from "@lms-repo/db/utils/mutation/submissions";
import {
	fetchSubmissionById,
	fetchSubmissionsFromUserCourses,
} from "@lms-repo/db/utils/query/submissions";
import { Hono } from "hono";
import { z } from "zod";
import { env } from "@lms-repo/env/server";

const storage = new Storage({
	apiEndpoint: env.GCS_EMULATOR_HOST,
	projectId: "dummy-project",
});

const bucket = storage.bucket(env.GCS_BUCKET_NAME);

export const submissionsRoute = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	// 署名付きURLの一括発行（複数ファイルアップロード用）
	.post(
		"/signed_urls",
		zValidator(
			"json",
			z.array(
				z.object({
					fileName: z.string(),
					fileType: z.string(),
				}),
			),
		),
		async (c) => {
			const files = c.req.valid("json");

			const signedUrls = await Promise.all(
				files.map(async ({ fileName, fileType }) => {
					const [signedUrl] = await bucket
						.file(`uploads/${fileName}`)
						.getSignedUrl({
							version: "v4",
							action: "write",
							expires: Date.now() + 15 * 60 * 1000,
							contentType: fileType,
						});

					return {
						fileName,
						signedUrl,
						objectName: `uploads/${fileName}`,
					};
				}),
			);

			return c.json(signedUrls);
		},
	)
	// ファイルメタデータの一括保存（複数ファイルアップロード用）
	.post(
		"/metadata",
		zValidator(
			"json",
			z.object({
				metadataList: z.array(
					z.object({
						objectName: z.string(),
						originalName: z.string(),
						mimeType: z.string(),
						fileSize: z.number(),
					}),
				),
				assignmentId: z.string(),
			}),
		),
		async (c) => {
			const { userId } = c.get("session");
			const { metadataList, assignmentId } = c.req.valid("json");

			// メタデータを一括保存
			const results = await Promise.all(
				metadataList.map(async (metadata) => {
					const result = await createFileSubmissionMetadata({
						bucket: "dummy-storage-bucket",
						...metadata,
						createdBy: userId,
					});
					return result;
				}),
			);

			// 提出状況を更新
			await db
				.insert(submissionStatus)
				.values({
					userId,
					assignmentId,
					status: "提出済み",
				})
				.onConflictDoUpdate({
					target: [submissionStatus.userId, submissionStatus.assignmentId],
					set: { status: "提出済み" },
				});

			return c.json({ successCount: results.length, results }, 201);
		},
	)
	// 課題の提出（テキスト形式）
	.post(
		"/text",
		zValidator("json", z.custom<Omit<TextSubmissions, "createdBy">>()),
		async (c) => {
			const { userId } = c.get("session");
			const { title, description } = c.req.valid("json");

			const result = await createTextSubmission({
				title,
				description,
				createdBy: userId,
			});
			return c.json(result, 201);
		},
	)
	// 課題提出状況の取得
	.get("/", async (c) => {
		const { userId } = c.get("session");
		const submissions = await fetchSubmissionsFromUserCourses(userId);
		return c.json(submissions, 200);
	})
	// 特定の課題提出状況の取得
	.get("/:assignmentId", async (c) => {
		const { userId } = c.get("session");
		const assignmentId = c.req.param("assignmentId");
		const submission = await fetchSubmissionById(userId, assignmentId);
		return c.json(submission, 200);
	});
