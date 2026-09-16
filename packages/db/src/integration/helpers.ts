import { sql } from "drizzle-orm";
import { db } from "../index";

// テスト用データベースのセットアップ
export async function setupTestDatabase() {
	// テスト用データベースの接続確認
	try {
		await db.execute(sql`SELECT 1`);
		console.log("Test database connection successful");
	} catch (error) {
		console.error("Test database connection failed:", error);
		throw error;
	}

	// データベースのセットアップ（必要な場合）
	try {
		// 既存のテーブルを確認
		const tables = await db.execute(sql`
			SELECT table_name 
			FROM information_schema.tables 
			WHERE table_schema = 'public'
		`);

		if (tables.rows.length === 0) {
			console.log("No tables found, setting up schema...");
			// better_authスキーマの作成
			await db.execute(sql`CREATE SCHEMA IF NOT EXISTS better_auth`);

			console.log(
				"Please run: bunx drizzle-kit push --config=drizzle.config.test.ts",
			);
		}
	} catch (error) {
		console.error("Database setup failed:", error);
		throw error;
	}
}

// テスト用データベースのクリーンアップ
export async function cleanupTestDatabase() {
	// better_authスキーマのテーブルを削除（順序考慮）
	const betterAuthTables = [
		"two_factor",
		"passkey",
		"verification",
		"account",
		"session",
		"user",
	];

	for (const table of betterAuthTables) {
		try {
			await db.execute(
				sql`TRUNCATE TABLE better_auth.${sql.identifier(table)} CASCADE`,
			);
		} catch (error) {
			// テーブルが存在しない場合は無視
			const errorStr = String(error);
			if (!errorStr.includes("does not exist")) {
				console.warn(`Failed to truncate table better_auth.${table}:`, error);
			}
		}
	}

	// publicスキーマのテーブルを削除（順序考慮）
	const publicTables = [
		"user_notifications",
		"notifications",
		"email_notification_settings",
		"comments",
		"submission_status",
		"file_submissions_metadata",
		"text_submissions",
		"assignments",
		"registration",
		"schedules",
		"announcements",
		"courses",
		"professors",
		"students",
		"departments",
		"faculties",
	];

	for (const table of publicTables) {
		try {
			await db.execute(sql`TRUNCATE TABLE ${sql.identifier(table)} CASCADE`);
		} catch (error) {
			// テーブルが存在しない場合は無視
			const errorStr = String(error);
			if (!errorStr.includes("does not exist")) {
				console.warn(`Failed to truncate table ${table}:`, error);
			}
		}
	}

	console.log("Test database cleanup completed");
}

// テストデータの作成
export async function createTestUser(
	email: string,
	name: string,
	role: string,
) {
	const { user } = await import("../schema/auth");

	const [newUser] = await db
		.insert(user)
		.values({
			email,
			name,
			role,
			emailVerified: true,
		})
		.returning();

	if (!newUser) {
		throw new Error("Failed to create test user");
	}

	return newUser;
}

export async function createTestFaculty(name: string) {
	const { faculties } = await import("../schema/service");

	const [newFaculty] = await db.insert(faculties).values({ name }).returning();

	if (!newFaculty) {
		throw new Error("Failed to create test faculty");
	}

	return newFaculty;
}

export async function createTestDepartment(name: string, facultyId: string) {
	const { departments } = await import("../schema/service");

	const [newDepartment] = await db
		.insert(departments)
		.values({
			name,
			facultyId,
			requiredCredits: 130,
		})
		.returning();

	if (!newDepartment) {
		throw new Error("Failed to create test department");
	}

	return newDepartment;
}
