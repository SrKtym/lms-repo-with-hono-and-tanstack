import { db } from ".";
import { coursesMaster } from "./constants";
import { courseList } from "./mockdata";
import { courses, departments, faculties } from "./schema";

export function getObjectValue<T extends object, K extends keyof T>(
	obj: T,
	key: K,
) {
	return obj[key];
}

export async function seedData() {
	const facultyNames = Object.keys(coursesMaster).filter(
		(name): name is keyof typeof coursesMaster => name in coursesMaster,
	);

	// 学科名から講義名のマッピング (例: { "文学科": ["文学理論", "日本史", ...] })
	const departmentToCoursesMap: Record<string, string[]> = {};

	facultyNames.forEach((facultyName) => {
		const facultyData = coursesMaster[facultyName];
		Object.entries(facultyData).forEach(([deptName, coursesList]) => {
			if (coursesList.length > 0) {
				departmentToCoursesMap[deptName] = coursesList;
			}
		});
	});

	await db.transaction(async (tx) => {
		try {
			// 学部の登録
			const insertedFaculties = await tx
				.insert(faculties)
				.values(facultyNames.map((name) => ({ name })))
				.returning()
				.onConflictDoNothing();

			// 講義名から学部IDを引くためのマッピング: { "文学部": "faculty-id-1", "理学部": "faculty-id-2" }
			const facultyMapping = new Map(
				insertedFaculties.map((f) => [f.name, f.id]),
			);
			const departmentNames = Object.values(coursesMaster).flatMap(Object.keys);
			const departmentValues = departmentNames.map((name) => {
				let facultyId: string | undefined;
				facultyNames.forEach((facultyName) => {
					if (name in coursesMaster[facultyName]) {
						facultyId = facultyMapping.get(facultyName);
					}
				});
				if (!facultyId) {
					throw new Error(`Faculty not found for department ${name}`);
				}
				return {
					name,
					facultyId,
				};
			});

			// 学科の登録
			const insertedDepartments = await tx
				.insert(departments)
				.values(departmentValues)
				.returning()
				.onConflictDoNothing();

			// 学科名から学科IDを引くためのマッピング: { "文学科": "dept-id-1", "理学科": "dept-id-2" }
			const deptMapping = new Map(
				insertedDepartments.map((d) => [d.name, d.id]),
			);

			const courseValues: (typeof courses.$inferInsert)[] = [];
			departmentNames.forEach((deptName) => {
				const departmentId = deptMapping.get(deptName);
				if (!departmentId) throw new Error(`Department ${deptName} not found`);

				const deptCourses = departmentToCoursesMap[deptName] || [];
				deptCourses.forEach((courseName: string) => {
					const courseValue = courseList.find(
						(course) => course.name === courseName,
					);
					if (!courseValue) throw new Error(`Course ${courseName} not found`);
					courseValues.push({
						...courseValue,
						departmentId,
						professorId: "temp-professor-id", // TODO: Create actual professor users
					});
				});
			});

			// 講義の登録
			await tx.insert(courses).values(courseValues).onConflictDoNothing();

			console.log("トランザクションが成功しました。");
		} catch (error) {
			console.error("トランザクションが失敗しました", error);
		}
	});
}
