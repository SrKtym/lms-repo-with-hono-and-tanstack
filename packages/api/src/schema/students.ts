import { getDepartmentName } from "@lms-repo/db/utils/helpers";
import { z } from "zod";

export const formSchema = z.object({
	grade: z
		.number()
		.int("対象学年は整数で入力してください")
		.min(1, "対象学年は1から4の間で入力してください")
		.max(4, "対象学年は1から4の間で入力してください"),
	departmentName: z.string().refine(
		(v) => {
			const departments = getDepartmentName();
			return departments.includes(v);
		},
		{
			error: "指定された学科が見つかりませんでした",
		},
	),
});
