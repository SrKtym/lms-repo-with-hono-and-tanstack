import { createFileRoute } from "@tanstack/react-router";
import RegisteredCourseContents from "@/components/private/courses/registered-course-contents";
import RegisteredCourseInfos from "@/components/private/courses/registered-course-infos";
import RegisteredCourseList from "@/components/private/courses/registered-course-list";
import { useRegisteredCourses } from "@/hooks/courses";

export const Route = createFileRoute(
	"/_my-page/course-list/{-$course-id}/{-$content-id}",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { "course-id": courseId, "content-id": contentId } = Route.useParams();
	const { data: courses = [] } = useRegisteredCourses();

	if (!courseId) return <RegisteredCourseList courses={courses} />;
	if (!contentId) return <RegisteredCourseInfos courseId={courseId} />;
	return <RegisteredCourseContents />;
}
