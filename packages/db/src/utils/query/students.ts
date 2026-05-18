import { eq } from "drizzle-orm";
import { db } from "../../index";
import { departments, faculties, students } from "../../schema";

// 学籍情報の取得
export async function fetchStudentData(userId: string) {
	const student = await db
		.select({
			department: departments.name,
			faculty: faculties.name,
			grade: students.grade,
			requiredCredit: students.requiredCredits,
		})
		.from(students)
		.innerJoin(departments, eq(students.departmentId, departments.id))
		.innerJoin(faculties, eq(departments.facultyId, faculties.id))
		.where(eq(students.id, userId))
		.limit(1);

	return student;
}

export type FetchStudentDataReturnType = Awaited<
	ReturnType<typeof fetchStudentData>
>;
