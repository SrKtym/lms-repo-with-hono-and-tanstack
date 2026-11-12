import { getDepartmentName } from "@lms-repo/db/utils/helpers";
import { z } from "zod";

export const formSchema = z.object({
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
