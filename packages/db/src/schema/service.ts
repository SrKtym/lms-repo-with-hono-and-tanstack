import { between, sql } from "drizzle-orm";
import {
	boolean,
	check,
	foreignKey,
	index,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { assignmentFormat } from "../constants";
import { user } from "./auth";

const requirements = ["必修", "選択必修", "任意"] as const;
export const requirementsEnum = pgEnum("requirements", requirements);

// 学生テーブル
export const students = pgTable("students", {
	id: text("id")
		.primaryKey()
		.references(() => user.id),
	grade: integer("grade").notNull(),
	departmentId: text("department_id")
		.notNull()
		.references(() => departments.id),
});

// 学部テーブル
export const faculties = pgTable("faculties", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull(),
});

// 学科テーブル
export const departments = pgTable("departments", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull(),
	facultyId: text("faculty_id")
		.notNull()
		.references(() => faculties.id),
});

// 講義テーブル
export const courses = pgTable(
	"courses",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		name: text("name").notNull(),
		targetGrade: integer("target_grade").notNull(),
		weekdays: integer("weekdays").notNull(),
		period: integer("period").notNull(),
		credits: integer("credits").notNull(),
		requirements: requirementsEnum("requirements").notNull(),
		classRoom: text("class_room").notNull(),
		departmentId: text("department_id")
			.notNull()
			.references(() => departments.id),
		professorId: text("professor_id")
			.notNull()
			.references(() => user.id),
	},
	(t) => [
		check("target_grade_range", between(t.targetGrade, 1, 4)),
		check("weekdays_range", between(t.weekdays, 1, 5)),
		check("period_range", between(t.period, 1, 5)),
		check("credits_range", between(t.credits, 1, 4)),
	],
);

// 履修登録テーブル
export const registration = pgTable(
	"registration",
	{
		userId: text("user_id"),
		courseId: text("course_id"),
	},
	(t) => [
		primaryKey({ columns: [t.userId, t.courseId] }),
		foreignKey({
			columns: [t.courseId],
			foreignColumns: [courses.id],
		}).onDelete("cascade"),
		foreignKey({ columns: [t.userId], foreignColumns: [user.id] }).onDelete(
			"cascade",
		),
	],
);

// お知らせテーブル
export const announcements = pgTable("announcements", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text("title").notNull(),
	description: text("description").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
	createdBy: text("created_by")
		.notNull()
		.references(() => user.id),
});

// スケジュールテーブル
export const schedules = pgTable("schedules", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text("title").notNull().default("タイトルなし"),
	description: text("description"),
	startTime: timestamp("start_time", { mode: "date", precision: 0 }).notNull(),
	endTime: timestamp("end_time", { mode: "date", precision: 0 }).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
	theme: text("theme").notNull().default("#000000"),
	createdBy: text("created_by")
		.notNull()
		.references(() => user.id),
});

// 課題テーブル
export const assignments = pgTable(
	"assignments",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		title: text("title").notNull(),
		description: text("description"),
		points: integer("points").notNull(),
		dueDate: timestamp("due_date", { mode: "date", precision: 0 }).notNull(),
		format: text("format").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
		createdBy: text("created_by")
			.notNull()
			.references(() => user.id),
	},
	(t) => [
		check("points_range", between(t.points, 0, 100)),
		check(
			"format_enum",
			sql`${t.format} IN (${sql.join([...assignmentFormat], ",")})`,
		),
	],
);

// テキスト形式の提出物
export const textSubmissions = pgTable("text_submissions", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text("title").notNull(),
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
	createdBy: text("created_by")
		.notNull()
		.references(() => user.id),
});

// ファイル形式の提出物メタデータ
export const fileSubmissionsMetadata = pgTable("file_submissions_metadata", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
});

// 提出状況テーブル
export const submissonStatus = pgTable(
	"submisson_status",
	{
		userId: text("user_id"),
		assignmentId: text("assignment_id"),
		isSubmitted: boolean("is_submitted").default(false).notNull(),
		score: integer("score"),
	},
	(t) => [
		primaryKey({ columns: [t.userId, t.assignmentId] }),
		check(
			"score_range",
			sql`(${t.isSubmitted} = false AND ${t.score} IS NULL) OR 
        (${t.isSubmitted} = true AND ${t.score} >= 0 AND ${t.score} <= 100)`,
		),
	],
);

// 通知テーブル
export const notifications = pgTable("notifications", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text("title").notNull(),
	description: text("description").notNull(),
	sender: text("sender").notNull(),
	receiver: text("receiver").notNull(),
	isRead: boolean("is_read").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// コメントテーブル
export const comments = pgTable("comments", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	content: text("content").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
	createdBy: text("created_by")
		.notNull()
		.references(() => user.id),
});

// // リレーション
// export const facultyRelations = relations(faculties, ({ many }) => ({
//     courses: many(courses),
//     departments: many(departments),
// }));

// export const departmentRelations = relations(departments, ({ one, many }) => ({
//     courses: many(courses),
//     faculties: one(faculties, {
//         fields: [departments.facultyId],
//         references: [faculties.id],
//     }),
// }));
