import { createFileRoute } from "@tanstack/react-router";
import { Notifications } from "@/components/private/notifications";
import { useRegisteredCourses } from "@/hooks/courses";

export const Route = createFileRoute("/_my-page/notifications")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: courses } = useRegisteredCourses();

	// 講義関連の通知を生成
	const courseNotifications =
		courses?.map((course) => ({
			id: `course-${course.id}`,
			title: `${course.name}の更新`,
			message: `次回授業: ${course.weekdays}曜日 ${course.period}限`,
			type: "info" as const,
			read: false,
			timestamp: new Date(),
		})) || [];

	return (
		<Notifications
			notifications={[
				...courseNotifications,
				{
					id: "system-1",
					title: "テスト通知",
					message: "これはシステム通知です",
					type: "info" as const,
					read: false,
					timestamp: new Date(),
				},
			]}
		/>
	);
}
