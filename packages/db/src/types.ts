import type {
	announcements,
	assignments,
	comments,
	courses,
	notifications,
	schedules,
} from "@lms-repo/db/schema/service";
import type { user } from "./schema/auth";

export type User = typeof user.$inferInsert;
export type Courses = typeof courses.$inferInsert;
export type Announcements = typeof announcements.$inferInsert;
export type Assignments = typeof assignments.$inferInsert;
export type Comments = typeof comments.$inferInsert;
export type Notifications = typeof notifications.$inferInsert;
export type Schedules = typeof schedules.$inferInsert;

export type CoursesOptional = "id" | "departmentId" | "professorId";
export type UserOptional = "id";
