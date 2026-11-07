import { and, eq, exists, or } from "drizzle-orm";
import { db } from "../../index";
import { announcements, courses, registration } from "../../schema";

// ユーザーが登録している講義の担当教員からのお知らせを取得（教員自身も作成したお知らせを取得）
export async function fetchAnnouncementsFromUserCourses(
	userId: string,
	courseId?: string,
) {
	const subQuery = db
		.select()
		.from(registration)
		.where(
			and(
				eq(registration.courseId, courses.id),
				eq(registration.userId, userId),
			),
		);

	const announcementsList = await db
		.select({
			id: announcements.id,
			title: announcements.title,
			description: announcements.description,
			type: announcements.type,
			createdAt: announcements.createdAt,
			updatedAt: announcements.updatedAt,
			courseId: courses.id,
			courseName: courses.name,
		})
		.from(announcements)
		.innerJoin(courses, eq(announcements.courseId, courses.id))
		.where(
			or(
				eq(courses.professorId, userId),
				exists(subQuery),
				courseId ? eq(announcements.courseId, courseId) : undefined,
			),
		);

	return announcementsList;
}

export type FetchAnnouncementsFromUserCoursesReturnType = Awaited<
	ReturnType<typeof fetchAnnouncementsFromUserCourses>
>;
