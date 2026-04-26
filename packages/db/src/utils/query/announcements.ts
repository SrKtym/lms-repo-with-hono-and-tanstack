import { eq } from "drizzle-orm";
import { db } from "../../index";
import {
	announcements,
	courses,
	departments,
	professors,
	registration,
	students,
} from "../../schema";

// ユーザーが登録している講義の担当教員からのお知らせを取得
export async function fetchAnnouncementsFromUserCourses(userId: string) {
	const announcementsList = await db
		.select({
			id: announcements.id,
			title: announcements.title,
			description: announcements.description,
			type: announcements.type,
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
			type: announcements.type,
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
	const announcementsList = await db.transaction(async (tx) => {
		// ユーザーが所属する学部IDを取得
		const userFaculty = await tx
			.select({ facultyId: departments.facultyId })
			.from(students)
			.innerJoin(departments, eq(students.departmentId, departments.id))
			.where(eq(students.id, userId))
			.limit(1);

		const facultyId = userFaculty[0]?.facultyId;

		if (!facultyId) {
			return [];
		}

		// 同学部内のすべての学科の教授からのお知らせを取得
		const announcementsList = await tx
			.select({
				id: announcements.id,
				title: announcements.title,
				description: announcements.description,
				type: announcements.type,
				createdAt: announcements.createdAt,
				updatedAt: announcements.updatedAt,
				createdBy: announcements.createdBy,
			})
			.from(announcements)
			.innerJoin(professors, eq(announcements.createdBy, professors.id))
			.innerJoin(departments, eq(professors.departmentId, departments.id))
			.where(eq(departments.facultyId, facultyId));

		return announcementsList;
	});

	return announcementsList;
}

export type FetchAnnouncementsFromUserFacultiesReturnType = Awaited<
	ReturnType<typeof fetchAnnouncementsFromUserFaculties>
>;

export async function fetchAnnouncementById(announcementId: string) {
	const announcement = await db
		.select({
			id: announcements.id,
			title: announcements.title,
			description: announcements.description,
			type: announcements.type,
			createdAt: announcements.createdAt,
			updatedAt: announcements.updatedAt,
			createdBy: announcements.createdBy,
		})
		.from(announcements)
		.where(eq(announcements.id, announcementId));
	return announcement;
}
