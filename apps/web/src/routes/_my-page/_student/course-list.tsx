import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import RegisteredCourseContents from "@/components/_my-page/_student/course-list/registered-course-contents";
import RegisteredCourseInfos from "@/components/_my-page/_student/course-list/registered-course-infos";
import RegisteredCourseList from "@/components/_my-page/_student/course-list/registered-course-list";
import { QUERY_CONFIG, queryClient } from "@/lib/query-client";
import { fetchAnnouncementsQueryFn } from "@/utils/query/announcements";
import { fetchAssignmentsQueryFn } from "@/utils/query/assignments";
import { fetchRegisteredCoursesQueryFn } from "@/utils/query/courses";
import { fetchSubmissionsStatusQueryFn } from "@/utils/query/submissions";

const searchSchema = z.object({
	"course-id": z.string().optional(),
	"assignment-id": z.string().optional(),
});

export const Route = createFileRoute("/_my-page/_student/course-list")({
	component: RouteComponent,
	validateSearch: (search) => searchSchema.parse(search),
	loaderDeps: ({
		search: { "course-id": courseId, "assignment-id": assignmentId },
	}) => ({
		courseId,
		assignmentId,
	}),
	loader: async ({ deps: { courseId, assignmentId } }) => {
		// キャッシュからデータ取得
		const [courses, announcements, assignments, submission] = await Promise.all(
			[
				queryClient.ensureQueryData({
					queryKey: ["registered-courses"],
					queryFn: fetchRegisteredCoursesQueryFn,
					...QUERY_CONFIG.USER_DATA,
				}),
				courseId
					? queryClient.ensureQueryData({
							queryKey: ["announcements-related-courses"],
							queryFn: () => fetchAnnouncementsQueryFn(courseId),
						})
					: Promise.resolve([]),
				courseId
					? queryClient.ensureQueryData({
							queryKey: ["assignments-related-courses"],
							queryFn: () => fetchAssignmentsQueryFn(courseId),
						})
					: Promise.resolve([]),
				assignmentId
					? queryClient.ensureQueryData({
							queryKey: ["submissions-status", assignmentId],
							queryFn: () => fetchSubmissionsStatusQueryFn(assignmentId),
						})
					: Promise.resolve([]),
			],
		);

		return { courses, announcements, assignments, submission };
	},
	head: ({ match }) => {
		const courseName =
			match.loaderData?.courses?.find(
				({ id }) => id === match.search["course-id"],
			)?.name || "講義一覧";

		const assignmentTitle = match.loaderData?.assignments?.find(
			({ id }) => id === match.search["assignment-id"],
		)?.title;

		const title = assignmentTitle ? ` - ${assignmentTitle}` : "";

		return {
			meta: [
				{
					title: `${courseName}${title} | LMS-repo`,
				},
			],
		};
	},
});

function RouteComponent() {
	const { "course-id": courseId, "assignment-id": assignmentId } =
		Route.useSearch();
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
	if (!assignmentId) {
		const targetCourse = coursesWithCoverImage.find(
			(course) => course.id === courseId,
		);
		return (
			<RegisteredCourseInfos
				courseWithCoverImage={targetCourse}
				announcements={announcements}
				assignments={assignments}
				courseId={courseId}
			/>
		);
	}
	// 課題詳細ページ
	const targetAssignment = assignments.find(
		(assignment) => assignment.id === assignmentId,
	);

	return (
		<RegisteredCourseContents
			targetAssignment={targetAssignment}
			submission={submission[0]}
			assignmentId={assignmentId}
		/>
	);
}
