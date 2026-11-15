import { z } from "zod";

export const formSchema = z
	.object({
		id: z
			.string()
			.transform((value) => (value === "" ? undefined : value))
			.optional(),
		title: z
			.string()
			.max(100, "タイトルは100文字以内で入力してください")
			.transform((value) => (value === "" ? "タイトルなし" : value))
			.optional(),
		description: z
			.string()
			.max(500, "説明は500文字以内で入力してください")
			.optional(),
		startTime: z.coerce
			.date()
			.min(new Date(), "開始日時は現在時刻以降でなければなりません。"),
		endTime: z.coerce.date(),
		theme: z
			.string()
			.regex(/^#[0-9a-f]{6}$/i, "有効なカラーコードを入力してください")
			.optional(),
	})
	.refine((value) => value.startTime < value.endTime, {
		path: ["endTime"],
		error: "開始日時は終了日時よりも前でなければなりません。",
	});
