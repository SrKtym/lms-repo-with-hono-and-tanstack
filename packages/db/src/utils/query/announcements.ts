import { eq, or } from "drizzle-orm";
import { db } from "../../index";
import { announcements, courses, registration } from "../../schema";

// ユーザーが登録している講義の担当教員からのお知らせを取得（教員自身も作成したお知らせを取得）
export async function fetchAnnouncementsFromUserCourses(userId: string) {
	const announcementsList = await db
		.selectDistinct({
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
		.leftJoin(registration, eq(courses.id, registration.courseId))
		.where(
			or(eq(registration.userId, userId), eq(courses.professorId, userId)),
		);

	return announcementsList;
}

export type FetchAnnouncementsFromUserCoursesReturnType = Awaited<
	ReturnType<typeof fetchAnnouncementsFromUserCourses>
>;
