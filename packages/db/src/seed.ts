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
	const departmentNames = new Set(
		facultyNames.map((name) => getObjectValue(coursesMaster, name)),
	);
	const data = Object.keys(departmentNames).filter(
		(name): name is keyof typeof departmentNames => name in departmentNames,
	);

	await db.transaction(async (tx) => {
		try {
			// 学部の登録
			const insertedFaculties = await tx
				.insert(faculties)
				.values(facultyNames.map((name) => ({ name })))
				.returning()
				.onConflictDoNothing();

			const facultyMapping = new Map(
				insertedFaculties.map((f) => [f.name, f.id]),
			);
			const departmentValues = facultyNames.map((name) => {
				const facultyId = facultyMapping.get(name);
				if (!facultyId) {
					throw new Error(`Faculty ${name} not found`);
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

			const deptMapping = new Map(
				insertedDepartments.map((d) => [d.name, d.id]),
			);
			const courseValues = departmentNames.map((name) => {
				const departmentId = deptMapping.get(name);
				if (!departmentId) throw new Error(`Department ${name} not found`);

				const courseValue = courseList.find((course) => course.name === name);
				if (!courseValue) throw new Error(`course ${courseValue} not found`);

				return {
					...courseValue,
					departmentId,
					professorId: "",
				};
			});

			// 講義の登録
			await tx.insert(courses).values(courseValues).onConflictDoNothing();

			console.log("トランザクションが成功しました。");
		} catch (error) {
			console.error("トランザクションが失敗しました", error);
		}
	});
}
