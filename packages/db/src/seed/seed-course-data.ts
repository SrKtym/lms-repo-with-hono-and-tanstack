import { eq } from "drizzle-orm";
import { db } from "..";
import { coursesMaster } from "../mock/constants";
import { courseList } from "../mock/mock-course-data";
import { courses, departments, faculties, user } from "../schema";

export async function seedCourseData() {
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

			const professorIds = await tx
				.select({ id: user.id })
				.from(user)
				.where(eq(user.role, "professor"));

			// Track professor assignments and their departments
			const professorCourseCount = new Map<string, number>();
			const professorDepartmentMap = new Map<string, string>(); // professorId -> departmentId

			// Helper function to find suitable professor for a course
			function findSuitableProfessor(
				departmentId: string,
				professorIds: { id: string }[],
			): string | undefined {
				let selectedProfessorId: string | undefined;
				let attempts = 0;
				const maxAttempts = professorIds.length * 3;

				// Try to find a professor with constraints
				while (attempts < maxAttempts && !selectedProfessorId) {
					const randomIndex = Math.floor(Math.random() * professorIds.length);
					const professorId = professorIds[randomIndex]?.id;

					if (!professorId) {
						attempts++;
						continue;
					}

					const currentCount = professorCourseCount.get(professorId) || 0;
					const assignedDepartment = professorDepartmentMap.get(professorId);

					// Check assignment constraints
					if (currentCount < 2) {
						if (currentCount === 0) {
							// 1-lecture: can be assigned to any department
							selectedProfessorId = professorId;
							professorCourseCount.set(professorId, 1);
							professorDepartmentMap.set(professorId, departmentId);
						} else if (currentCount === 1) {
							// 2-lecture: must be from the same department as first course
							if (assignedDepartment === departmentId) {
								selectedProfessorId = professorId;
								professorCourseCount.set(professorId, 2);
							}
						}
					}
					attempts++;
				}

				return selectedProfessorId;
			}

			// Helper function to find professor with minimum course count
			function findProfessorWithMinimumCount(
				departmentId: string,
				professorIds: { id: string }[],
			): string | undefined {
				let minCount = Number.POSITIVE_INFINITY;
				let minProfessorId: string | undefined;

				for (const professor of professorIds) {
					const count = professorCourseCount.get(professor.id) || 0;
					const assignedDept = professorDepartmentMap.get(professor.id);

					// Prefer professors with 0 courses, then 1 course in same department
					if (count === 0) {
						minCount = count;
						minProfessorId = professor.id;
					} else if (
						count === 1 &&
						assignedDept === departmentId &&
						count < minCount
					) {
						minCount = count;
						minProfessorId = professor.id;
					}
				}

				if (minProfessorId) {
					const currentCount = professorCourseCount.get(minProfessorId) || 0;
					professorCourseCount.set(minProfessorId, currentCount + 1);

					// Set department assignment for first course
					if (currentCount === 0) {
						professorDepartmentMap.set(minProfessorId, departmentId);
					}
				}

				return minProfessorId;
			}

			// Helper function to assign professor as last resort
			function assignProfessorAsLastResort(
				departmentId: string,
				professorIds: { id: string }[],
			): string | undefined {
				const randomIndex = Math.floor(Math.random() * professorIds.length);
				const professorId = professorIds[randomIndex]?.id;

				if (professorId) {
					const currentCount = professorCourseCount.get(professorId) || 0;
					professorCourseCount.set(professorId, currentCount + 1);

					if (currentCount === 0) {
						professorDepartmentMap.set(professorId, departmentId);
					}
				}

				return professorId;
			}

			// Assign professors to all courses
			departmentNames.forEach((deptName) => {
				const departmentId = deptMapping.get(deptName);
				if (!departmentId) throw new Error(`Department ${deptName} not found`);

				const deptCourses = departmentToCoursesMap[deptName] || [];
				deptCourses.forEach((courseName: string) => {
					const courseValue = courseList.find(
						(course) => course.name === courseName,
					);
					if (!courseValue) throw new Error(`Course ${courseName} not found`);

					// Try to find suitable professor with constraints
					let selectedProfessorId = findSuitableProfessor(
						departmentId,
						professorIds,
					);

					// If no suitable professor found, assign to professor with minimum count
					if (!selectedProfessorId) {
						selectedProfessorId = findProfessorWithMinimumCount(
							departmentId,
							professorIds,
						);
					}

					// Last resort: assign to any available professor
					if (!selectedProfessorId) {
						selectedProfessorId = assignProfessorAsLastResort(
							departmentId,
							professorIds,
						);
					}

					if (!selectedProfessorId) {
						throw new Error(`Professor not found for course ${courseName}`);
					}

					courseValues.push({
						...courseValue,
						departmentId,
						professorId: selectedProfessorId,
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
