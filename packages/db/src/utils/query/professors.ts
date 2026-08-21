import { eq } from "drizzle-orm";
import { db } from "../..";
import { departments, faculties, professors } from "../../schema";

// 教授情報の取得
export async function fetchProfData(userId: string) {
	const [professor] = await db
		.select({
			departmentId: departments.id,
			department: departments.name,
			faculty: faculties.name,
		})
		.from(professors)
		.innerJoin(departments, eq(professors.departmentId, departments.id))
		.innerJoin(faculties, eq(departments.facultyId, faculties.id))
		.where(eq(professors.id, userId))
		.limit(1);

	return professor;
}
