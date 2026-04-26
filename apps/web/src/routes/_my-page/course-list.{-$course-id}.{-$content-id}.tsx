import { createFileRoute } from "@tanstack/react-router";
import RegisteredCourseContents from "@/components/private/courses/registered-course-contents";
import RegisteredCourseInfos from "@/components/private/courses/registered-course-infos";
import RegisteredCourseList from "@/components/private/courses/registered-course-list";
import { queryClient } from "@/lib/query-client";
import {
	fetchAnnouncementsQueryFn,
	fetchAssignmentsQueryFn,
	fetchRegisteredCoursesQueryFn,
} from "@/utils/query-utils";

export const Route = createFileRoute(
	"/_my-page/course-list/{-$course-id}/{-$content-id}",
)({
	component: RouteComponent,
	loader: async ({ params: { "content-id": contentId } }) => {
		// キャッシュからデータ取得（既にプリフェッチ済み）
		const [courses, announcements, assignments] = await Promise.all([
			queryClient.ensureQueryData({
				queryKey: ["registered-courses"],
				queryFn: fetchRegisteredCoursesQueryFn,
				staleTime: 5 * 60 * 1000, // 5 minutes
			}),

			queryClient.ensureQueryData({
				queryKey: ["announcements-related-courses"],
				queryFn: fetchAnnouncementsQueryFn,
				staleTime: 5 * 60 * 1000, // 5 minutes
			}),
			queryClient.ensureQueryData({
				queryKey: ["assignments", contentId],
				queryFn: () => fetchAssignmentsQueryFn(contentId),
				staleTime: 5 * 60 * 1000, // 5 minutes
			}),
		]);

		return { courses, announcements, assignments };
	},
});

function RouteComponent() {
	const { "course-id": courseId, "content-id": contentId } = Route.useParams();
	const {
		courses = [],
		announcements = [],
		assignments = [],
	} = Route.useLoaderData();

	// 各講義のカバー画像を生成し、coursesWithCoverImageに追加
	const dataLength = courses.length;
	const coverImageList = Array.from(
		{ length: dataLength },
		(_, i) => `https://img.heroui.chat/image/landscape?w=800&h=200&u=${i + 1}`,
	);
	const coursesWithCoverImage = courses.map((course, index) => ({
		...course,
		coverImage: coverImageList[index],
	}));

	if (!courseId)
		return (
			<RegisteredCourseList coursesWithCoverImage={coursesWithCoverImage} />
		);
	if (!contentId) {
		const targetCourse = coursesWithCoverImage.find(
			(course) => course.id === courseId,
		);
		return (
			<RegisteredCourseInfos
				courseWithCoverImage={targetCourse}
				announcements={announcements}
				assignments={assignments}
			/>
		);
	}
	return <RegisteredCourseContents />;
}
