import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import CreatedCourseContents from "@/components/_my-page/_prof/course-management/created-course-contents";
import CreatedCourseInfos from "@/components/_my-page/_prof/course-management/created-course-infos";
import CreatedCourseList from "@/components/_my-page/_prof/course-management/created-course-list";
import { QUERY_CONFIG, queryClient } from "@/lib/query-client";
import { fetchAnnouncementsQueryFn } from "@/utils/query/announcements";
import { fetchAssignmentsQueryFn } from "@/utils/query/assignments";
import { fetchCreatedCoursesQueryFn } from "@/utils/query/courses";

const searchSchema = z.object({
	"course-id": z.string().optional(),
	"assignment-id": z.string().optional(),
});

export const Route = createFileRoute("/_my-page/_prof/course-management")({
	component: RouteComponent,
	validateSearch: (search) => searchSchema.parse(search),
	loaderDeps: ({ search: { "assignment-id": assignmentId } }) => ({
		assignmentId,
	}),
	loader: async ({ context }) => {
		if (!context.session.data?.user) {
			throw new Error("ユーザーが見つかりません");
		}

		// キャッシュからデータ取得
		const [courses, announcements, assignments] = await Promise.all([
			queryClient.ensureQueryData({
				queryKey: ["created-courses"],
				queryFn: fetchCreatedCoursesQueryFn,
				...QUERY_CONFIG.USER_DATA,
			}),
			queryClient.ensureQueryData({
				queryKey: ["announcements-related-courses"],
				queryFn: fetchAnnouncementsQueryFn,
			}),
			queryClient.ensureQueryData({
				queryKey: ["assignments-related-courses"],
				queryFn: fetchAssignmentsQueryFn,
			}),
		]);

		return { courses, announcements, assignments };
	},
	head: ({ match }) => {
		const courseName =
			match.loaderData?.courses?.find(
				({ id }) => id === match.search["course-id"],
			)?.name || "講義管理";

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
	const { courses, announcements, assignments } = Route.useLoaderData();

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

	// 講義一覧ページ
	if (!courseId) {
		return <CreatedCourseList coursesWithCoverImage={coursesWithCoverImage} />;
	}
	// 講義詳細ページ
	if (!assignmentId) {
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
			<CreatedCourseInfos
				courseWithCoverImage={targetCourse}
				announcements={targetAnnouncements}
				assignments={targetAssignments}
				courseId={courseId}
			/>
		);
	}
	// 課題詳細ページ
	const targetAssignment = assignments.find(
		(assignment) => assignment.id === assignmentId,
	);

	return (
		<CreatedCourseContents
			targetAssignment={targetAssignment}
			assignmentId={assignmentId}
		/>
	);
}
