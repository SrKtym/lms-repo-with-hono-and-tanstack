import { z } from "zod";

export const formSchema = z.object({
	content: z
		.string()
		.min(1, "内容を入力してください")
		.max(500, "内容は500文字以内で入力してください"),
});
