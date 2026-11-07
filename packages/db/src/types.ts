import type {
	announcements,
	assignments,
	comments,
	courses,
	emailNotificationSettings,
	fileSubmissionsMetadata,
	notifications,
	registration,
	schedules,
	textSubmissions,
} from "@lms-repo/db/schema/service";
import type { user } from "./schema/auth";

// データ挿入時の型
export type User = typeof user.$inferInsert;
export type Courses = typeof courses.$inferInsert;
export type Announcements = typeof announcements.$inferInsert;
export type Assignments = typeof assignments.$inferInsert;
export type Comments = typeof comments.$inferInsert;
export type Notifications = typeof notifications.$inferInsert;
export type Schedules = typeof schedules.$inferInsert;
export type Registration = typeof registration.$inferInsert;
export type EmailNotificationSettings =
	typeof emailNotificationSettings.$inferInsert;
export type TextSubmissions = typeof textSubmissions.$inferInsert;
export type FileSubmissionsMetadata =
	typeof fileSubmissionsMetadata.$inferInsert;

// データ挿入時のオプショナルフィールド
export type CoursesOptional = "departmentId" | "professorId";
export type AssignmentsOptional = "id" | "courseId" | "createdAt" | "updatedAt";
export type NotificationsOptional = "id" | "createdAt";

type PartiallyPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type PickUserDataType = Pick<
	typeof user.$inferSelect,
	"id" | "name" | "email" | "role" | "image"
>;
// データ取得時の型
export type UserDataTypeWithImage = PartiallyPartial<
	Omit<PickUserDataType, "id">,
	"role" | "image"
>;
export type UserDataTypeWithId = PartiallyPartial<
	Omit<PickUserDataType, "image">,
	"role"
>;
