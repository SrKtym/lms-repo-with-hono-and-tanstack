import type { courses } from "@lms-repo/db/schema/service";

export type Courses = typeof courses.$inferInsert;
export type Optional = "id" | "departmentId" | "professorId";
