import { sql } from "drizzle-orm";
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
import { user } from "./auth";

const requirements = ["必修", "選択必修", "任意"] as const;
export const requirementsEnum = pgEnum("requirements", requirements);
const assignmentFormat = [
	"text",
	"pdf",
	"excel",
	"word",
	"powerpoint",
] as const;

const announcementType = ["資料", "アンケート", "その他"] as const;

// 学生テーブル
export const students = pgTable(
	"students",
	{
		id: text("id")
			.primaryKey()
			.references(() => user.id),
		grade: integer("grade").notNull(),
		departmentId: text("department_id")
			.notNull()
			.references(() => departments.id),
	},
	(t) => [check("grade_range", sql`${t.grade} >= 1 AND ${t.grade} <= 4`)],
);

// 教授テーブル
export const professors = pgTable("professors", {
	id: text("id")
		.primaryKey()
		.references(() => user.id),
	departmentId: text("department_id")
		.notNull()
		.references(() => departments.id),
});

// 学部テーブル
export const faculties = pgTable("faculties", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").unique().notNull(),
});

// 学科テーブル
export const departments = pgTable("departments", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").unique().notNull(),
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
		check(
			"target_grade_range",
			sql`${t.targetGrade} >= 1 AND ${t.targetGrade} <= 4`,
		),
		check("weekdays_range", sql`${t.weekdays} >= 1 AND ${t.weekdays} <= 5`),
		check("period_range", sql`${t.period} >= 1 AND ${t.period} <= 5`),
		check("credits_range", sql`${t.credits} >= 1 AND ${t.credits} <= 4`),
	],
);

// 履修登録テーブル
export const registration = pgTable(
	"registration",
	{
		userId: text("user_id").notNull(),
		courseId: text("course_id").notNull(),
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
export const announcements = pgTable(
	"announcements",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		title: text("title").notNull(),
		description: text("description").notNull(),
		type: text("type").notNull(),
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
		check(
			"type_check",
			sql`${t.type} IN (${sql.raw(
				[...announcementType].map((t) => `'${t}'`).join(", "),
			)})`,
		),
	],
);

// スケジュールテーブル
export const schedules = pgTable("schedules", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text("title").notNull().default("タイトルなし"),
	description: text("description").notNull().default(""),
	startTime: timestamp("start_time", { mode: "date", precision: 0 }).notNull(),
	endTime: timestamp("end_time", { mode: "date", precision: 0 }).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
	theme: text("theme").notNull().default("#059669"),
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
		courseId: text("course_id")
			.notNull()
			.references(() => courses.id),
	},
	(t) => [
		check("points_range", sql`${t.points} >= 0 AND ${t.points} <= 100`),
		check(
			"format_enum",
			sql`${t.format} IN (${sql.raw([...assignmentFormat].map((f) => `'${f}'`).join(","))})`,
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
		userId: text("user_id").notNull(),
		assignmentId: text("assignment_id").notNull(),
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
