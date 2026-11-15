import { z } from "zod";

// ファイルアップロードの制限
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILE_COUNT = 5;
const ALLOWED_MIME_TYPES = [
	"application/pdf",
	"application/msword",
	"application/vnd.ms-excel",
	"application/vnd.ms-powerpoint",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const UUID_V4_SOURCE =
	"[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
const UUID_V4_PATTERN = new RegExp(`^${UUID_V4_SOURCE}$`);
const SUBMISSION_OBJECT_NAME_PATTERN = new RegExp(
	`^submissions/[^/]+/[^/]+/[^/]+/${UUID_V4_SOURCE}$`,
);

const allowedMimeTypeSchema = z
	.string()
	.refine((v) => ALLOWED_MIME_TYPES.includes(v), {
		error: ({ input }) => `許可されていないファイルタイプです: ${input}`,
	});

const metadataItemShape = {
	originalName: z.string(),
	mimeType: allowedMimeTypeSchema,
	fileSize: z
		.number()
		.max(MAX_FILE_SIZE, "ファイルサイズは10MB以下である必要があります"),
} as const;

const submissionFileSchema = z
	.file()
	.refine((file) => file.size <= MAX_FILE_SIZE, {
		error: "ファイルサイズは10MB以下である必要があります",
	})
	.refine((file) => ALLOWED_MIME_TYPES.includes(file.type), {
		error: "許可されていないファイルタイプです",
	});

const submissionObjectNameSchema = z
	.string()
	.regex(SUBMISSION_OBJECT_NAME_PATTERN, "objectName is invalid");

// 署名付きURL生成スキーマ
export const signedUrlSchema = z
	.array(
		z.object({
			fileName: z.string(),
			fileType: allowedMimeTypeSchema,
			fileSize: z
				.number()
				.max(MAX_FILE_SIZE, "ファイルサイズは10MB以下である必要があります"),
		}),
	)
	.max(
		MAX_FILE_COUNT,
		`一度にアップロードできるファイルは${MAX_FILE_COUNT}個までです`,
	);

// エミュレータ環境用の直接アップロードスキーマ
export const uploadFormSchema = z.object({
	files: z.union([z.array(submissionFileSchema), submissionFileSchema]).refine(
		(files) => {
			const fileList = Array.isArray(files) ? files : [files];
			return fileList.length > 0 && fileList.length <= MAX_FILE_COUNT;
		},
		{
			error: `一度にアップロードできるファイルは${MAX_FILE_COUNT}個までです`,
		},
	),
});

// RPCの型付けと基本形状の検証用スキーマ
export const metadataSchema = z.object({
	metadataList: z
		.array(
			z.object({
				objectName: submissionObjectNameSchema,
				...metadataItemShape,
			}),
		)
		.max(
			MAX_FILE_COUNT,
			`一度にアップロードできるファイルは${MAX_FILE_COUNT}個までです`,
		),
});

// objectNameは submissions/{courseId}/{assignmentId}/{userId}/{uuidv4} と
// 現在のリクエストのprefixに一致する場合のみ許可する
export function createMetadataSchema(objectNamePrefix: string) {
	return z.object({
		metadataList: z
			.array(
				z.object({
					objectName: z
						.string()
						.refine(
							(objectName) =>
								objectName.startsWith(objectNamePrefix) &&
								UUID_V4_PATTERN.test(objectName.slice(objectNamePrefix.length)),
							{ error: "objectName is invalid" },
						),
					...metadataItemShape,
				}),
			)
			.max(
				MAX_FILE_COUNT,
				`一度にアップロードできるファイルは${MAX_FILE_COUNT}個までです`,
			),
	});
}

// テキスト提出物スキーマ
export const textSubmissionsSchema = z.object({
	title: z
		.string()
		.min(1, "タイトルは必須です")
		.max(100, "タイトルは100文字以内で入力してください"),
	description: z
		.string()
		.min(1, "説明は必須です")
		.max(2000, "説明は2000文字以内で入力してください"),
});
