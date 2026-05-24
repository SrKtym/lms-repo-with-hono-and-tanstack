import { createFileRoute } from "@tanstack/react-router";
import RegisteredCourseContents from "@/components/private/courses/registered-course-contents";
import RegisteredCourseInfos from "@/components/private/courses/registered-course-infos";
import RegisteredCourseList from "@/components/private/courses/registered-course-list";
import { queryClient } from "@/lib/query-client";
import {
	fetchAnnouncementsQueryFn,
	fetchAssignmentsQueryFn,
	fetchRegisteredCoursesQueryFn,
	fetchSubmissionByIdQueryFn,
} from "@/utils/query-utils";

export const Route = createFileRoute(
	"/_my-page/course-list/{-$course-id}/{-$content-id}",
)({
	component: RouteComponent,
	loader: async ({ params }) => {
		const { "content-id": contentId } = params;
		// キャッシュからデータ取得
		const [courses, announcements, assignments, submission] = await Promise.all(
			[
				queryClient.ensureQueryData({
					queryKey: ["registered-courses"],
					queryFn: fetchRegisteredCoursesQueryFn,
					staleTime: 1000 * 60 * 60 * 24, // 24時間は「新鮮」と見なす
					gcTime: 1000 * 60 * 60 * 24 * 7, // 7日間はキャッシュを保持
				}),
				queryClient.ensureQueryData({
					queryKey: ["announcements-related-courses"],
					queryFn: fetchAnnouncementsQueryFn,
					staleTime: 5 * 60 * 1000, // 5 minutes
				}),
				queryClient.ensureQueryData({
					queryKey: ["assignments-related-courses"],
					queryFn: fetchAssignmentsQueryFn,
					staleTime: 5 * 60 * 1000, // 5 minutes
				}),
				queryClient.ensureQueryData({
					queryKey: ["submissions-related-courses", contentId],
					queryFn: () => fetchSubmissionByIdQueryFn(contentId),
					staleTime: 5 * 60 * 1000, // 5 minutes
				}),
			],
		);

		return { courses, announcements, assignments, submission };
	},
});

function RouteComponent() {
	const { "course-id": courseId, "content-id": contentId } = Route.useParams();
	const { courses, announcements, assignments, submission } =
		Route.useLoaderData();

	// 各講義のカバー画像を生成し、coursesWithCoverImageに追加
	const dataLength = courses.length;
	const coverImageList = Array.from(
		{ length: dataLength },
		(_, i) => `https://img.heroui.chat/image/landscape?w=1200&h=400&u=${i + 1}`,
	);
	const coursesWithCoverImage = courses.map((course, index) => ({
		...course,
		coverImage: coverImageList[index],
	}));

	// 登録講義一覧ページ
	if (!courseId) {
		return (
			<RegisteredCourseList coursesWithCoverImage={coursesWithCoverImage} />
		);
	}
	// 講義詳細ページ
	if (!contentId) {
		const targetCourse = coursesWithCoverImage.find(
			(course) => course.id === courseId,
		);
		const targetAnnouncements = announcements.filter(
			(announcement) => announcement.courseId === courseId,
		);
		const targetAssignments = assignments.filter(
			(assignment) => assignment.courseId === courseId,
		);
		return (
			<RegisteredCourseInfos
				courseWithCoverImage={targetCourse}
				announcements={targetAnnouncements}
				assignments={targetAssignments}
				courseId={courseId}
			/>
		);
	}
	// 課題詳細ページ
	const targetAssignment = assignments.find(
		(assignment) => assignment.id === contentId,
	);

	return (
		<RegisteredCourseContents
			targetAssignment={targetAssignment}
			submission={submission[0]}
			assignmentId={contentId}
		/>
	);
}
