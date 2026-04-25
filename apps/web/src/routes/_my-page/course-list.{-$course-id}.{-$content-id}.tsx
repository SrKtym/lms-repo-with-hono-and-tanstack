import { createFileRoute } from "@tanstack/react-router";
import RegisteredCourseContents from "@/components/private/courses/registered-course-contents";
import RegisteredCourseInfos from "@/components/private/courses/registered-course-infos";
import RegisteredCourseList from "@/components/private/courses/registered-course-list";
import { client } from "@/lib/hono-client";
import { queryClient } from "@/lib/query-client";

export const Route = createFileRoute(
	"/_my-page/course-list/{-$course-id}/{-$content-id}",
)({
	component: RouteComponent,
	loader: async () => {
		// キャッシュからデータ取得（既にプリフェッチ済み）
		const courses = await queryClient.ensureQueryData({
			queryKey: ["registered-courses"],
			queryFn: async () => {
				const res = await client.api.courses.search.registered.$get();
				const data = await res.json();
				if ("message" in data) {
					return [];
				}
				return data;
			},
			staleTime: 5 * 60 * 1000, // 5 minutes
		});
		return { courses };
	},
});

function RouteComponent() {
	const { "course-id": courseId, "content-id": contentId } = Route.useParams();
	const { courses = [] } = Route.useLoaderData();
	const dataLength = courses.length;
	const coverImageList = Array.from(
		{ length: dataLength },
		(_, i) => `https://img.heroui.chat/image/landscape?w=800&h=200&u=${i + 1}`,
	);
	const coursesWithCoverImage = courses.map((course, index) => ({
		...course,
		coverImage: coverImageList[index],
	}));

	if (!courseId) return <RegisteredCourseList coursesWithCoverImage={coursesWithCoverImage} />;
	if (!contentId) {
		const targetCourse = coursesWithCoverImage.find((course) => course.id === courseId);
		return (
			<RegisteredCourseInfos courseWithCoverImage={targetCourse} />
		);
	}
	return <RegisteredCourseContents />;
}
