import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "bun:test";
import { db } from "../index";
import {
	cleanupTestDatabase,
	createTestDepartment,
	createTestFaculty,
	createTestUser,
	setupTestDatabase,
} from "./helpers";

describe("認証フロー結合テスト", () => {
	beforeAll(async () => {
		await setupTestDatabase();
	});

	beforeEach(async () => {
		await cleanupTestDatabase();
	});

	afterAll(async () => {
		await cleanupTestDatabase();
	});

	it("ユーザー作成とデータベース保存", async () => {
		const testUser = await createTestUser(
			"test@example.com",
			"テストユーザー",
			"student",
		);

		expect(testUser).toBeDefined();
		expect(testUser.email).toBe("test@example.com");
		expect(testUser.name).toBe("テストユーザー");
		expect(testUser.role).toBe("student");
		expect(testUser.emailVerified).toBe(true);
	});

	it("学部と学科の作成", async () => {
		const faculty = await createTestFaculty("文学部");
		expect(faculty).toBeDefined();
		expect(faculty.name).toBe("文学部");

		const department = await createTestDepartment("史学科", faculty.id);
		expect(department).toBeDefined();
		expect(department.name).toBe("史学科");
		expect(department.facultyId).toBe(faculty.id);
	});

	it("教授ユーザーの作成と学科への割り当て", async () => {
		// 学部と学科を作成
		const faculty = await createTestFaculty("経済学部");
		const department = await createTestDepartment("経済学科", faculty.id);

		// 教授ユーザーを作成
		const professor = await createTestUser(
			"professor@example.com",
			"テスト教授",
			"professor",
		);

		// 教授テーブルにデータを挿入
		const { professors } = await import("../schema/service");
		const [professorRecord] = await db
			.insert(professors)
			.values({
				id: professor.id,
				departmentId: department.id,
			})
			.returning();

		expect(professorRecord).toBeDefined();
		expect(professorRecord?.id).toBe(professor.id);
		expect(professorRecord?.departmentId).toBe(department.id);
	});

	it("学生ユーザーの作成と学科への割り当て", async () => {
		// 学部と学科を作成
		const faculty = await createTestFaculty("工学部");
		const department = await createTestDepartment("情報工学科", faculty.id);

		// 学生ユーザーを作成
		const student = await createTestUser(
			"student@example.com",
			"テスト学生",
			"student",
		);

		// 学生テーブルにデータを挿入
		const { students } = await import("../schema/service");
		const [studentRecord] = await db
			.insert(students)
			.values({
				id: student.id,
				grade: 1,
				departmentId: department.id,
			})
			.returning();

		expect(studentRecord).toBeDefined();
		expect(studentRecord?.id).toBe(student.id);
		expect(studentRecord?.grade).toBe(1);
		expect(studentRecord?.departmentId).toBe(department.id);
	});
});
