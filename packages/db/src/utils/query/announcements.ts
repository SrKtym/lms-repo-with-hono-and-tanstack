import { eq } from "drizzle-orm";
import { db } from "../../index";
import { announcements, courses, professors, registration, students } from "../../schema";

// ユーザーが登録している講義の担当教員からのお知らせを取得
export async function fetchAnnouncementsFromUserCourses(userId: string) {
	const announcementsList = await db
		.select({
			id: announcements.id,
			title: announcements.title,
			description: announcements.description,
			createdAt: announcements.createdAt,
			updatedAt: announcements.updatedAt,
			createdBy: announcements.createdBy,
		})
		.from(announcements)
		.innerJoin(courses, eq(announcements.createdBy, courses.professorId))
		.innerJoin(registration, eq(courses.id, registration.courseId))
		.where(eq(registration.userId, userId));

	return announcementsList;
}

export type FetchAnnouncementsFromUserCoursesReturnType = Awaited<
	ReturnType<typeof fetchAnnouncementsFromUserCourses>
>;

// ユーザーが所属する学科の教授からのお知らせを取得
export async function fetchAnnouncementsFromUserDeps(userId: string) {
	const announcementsList = await db
		.select({
			id: announcements.id,
			title: announcements.title,
			description: announcements.description,
			createdAt: announcements.createdAt,
			updatedAt: announcements.updatedAt,
			createdBy: announcements.createdBy,
		})
		.from(announcements)
		.innerJoin(professors, eq(announcements.createdBy, professors.id))
		.innerJoin(students, eq(professors.departmentId, students.departmentId))
		.where(eq(students.id, userId));

	return announcementsList;
}

export type FetchAnnouncementsFromUserDepsReturnType = Awaited<
	ReturnType<typeof fetchAnnouncementsFromUserDeps>
>;

// ユーザーが所属する学部の教授からのお知らせを取得
export async function fetchAnnouncementsFromUserFaculties(userId: string) {
	const announcementsList = await db
		.select({
			id: announcements.id,
			title: announcements.title,
			description: announcements.description,
			createdAt: announcements.createdAt,
			updatedAt: announcements.updatedAt,
			createdBy: announcements.createdBy,
		})
		.from(announcements)
		.innerJoin(professors, eq(announcements.createdBy, professors.id))
		.innerJoin(students, eq(professors.departmentId, students.departmentId))
		.where(eq(students.id, userId));

	return announcementsList;
}

export type FetchAnnouncementsFromUserFacultiesReturnType = Awaited<
	ReturnType<typeof fetchAnnouncementsFromUserFaculties>
>;

export async function fetchAnnouncementById(announcementId: string) {
	const announcement = await db
		.select()
		.from(announcements)
		.where(eq(announcements.id, announcementId));
	return announcement;
}