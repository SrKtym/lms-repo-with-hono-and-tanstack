import { coursesMaster } from "../mock/course-master";

// 学科名の配列を取得
export function getDepartmentName() {
	const facultyNames = Object.keys(coursesMaster).filter(
		(name): name is keyof typeof coursesMaster => name in coursesMaster,
	);

	const departments: string[] = [];

	facultyNames.forEach((facultyName) => {
		const departmentData = coursesMaster[facultyName];
		const filteredDepartments = Object.keys(departmentData).filter(
			(key) => key !== "全学科",
		);
		departments.push(...filteredDepartments);
	});

	return departments;
}
