import { createFileRoute } from "@tanstack/react-router";
import { Notifications } from "@/components/private/notifications";
import { client } from "@/lib/hono-client";
import { queryClient } from "@/lib/query-client";

export const Route = createFileRoute("/_my-page/notifications")({
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
			staleTime: 5 * 60 * 1000,
		});
		return { courses };
	},
});

function RouteComponent() {
	const { courses } = Route.useLoaderData();

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
