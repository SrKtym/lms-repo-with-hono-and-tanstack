import { AssignmentsProgressCard } from "@lms-repo/ui/components/cards/assignments-progress-card";
import { DailySchedulesCard } from "@lms-repo/ui/components/cards/daily-schedules-card";
import { NotificationsListCard } from "@lms-repo/ui/components/cards/notifications-list-card";
import { UpcomingAssignmentsCard } from "@lms-repo/ui/components/cards/upcoming-assignments-card";
import { createFileRoute } from "@tanstack/react-router";
import { queryClient } from "@/lib/query-client";
import { client } from "@/lib/hono-client";

export const Route = createFileRoute("/_my-page/dashboard")({
	component: RouteComponent,
	loader: async () => {
		// キャッシュからデータ取得（既にプリフェッチ済み）
		const [courses, schedules] = await Promise.all([
			queryClient.ensureQueryData({
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
			}),

			queryClient.ensureQueryData({
				queryKey: ["schedules"],
				queryFn: async () => {
					const res = await client.api.schedules.select.$get();
					const data = await res.json();
					return data.map((schedule) => ({
						...schedule,
						startTime: new Date(schedule.startTime),
						endTime: new Date(schedule.endTime),
						createdAt: new Date(schedule.createdAt),
						updatedAt: new Date(schedule.updatedAt),
					}));
				},
				staleTime: 5 * 60 * 1000,
			}),
		]);
		return { courses, schedules };
	},
});

function RouteComponent() {
	const { courses = [], schedules = [] } = Route.useLoaderData();

	return (
		<div className="p-3">
			{/* Dashboard Header */}
			<div className="mb-6 lg:mb-8">
				<h1 className="mb-2 font-bold text-2xl text-gray-900 lg:text-3xl dark:text-gray-100">
					ダッシュボード
				</h1>
				<p className="text-gray-600 dark:text-gray-400">
					{new Date().toLocaleDateString("ja-JP", {
						weekday: "long",
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
				</p>
			</div>

			{/* Main Dashboard Grid */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
				{/* Desktop Layout - Left Column */}
				<div className="hidden lg:col-span-2 lg:block lg:space-y-6">
					<DailySchedulesCard courses={courses} schedules={schedules} />
					<UpcomingAssignmentsCard />
				</div>

				{/* Desktop Layout - Right Column */}
				<div className="hidden lg:block lg:space-y-6">
					<NotificationsListCard />
					<AssignmentsProgressCard />
				</div>

				{/* Mobile Layout - Custom Order */}
				<div className="space-y-4 lg:hidden">
					<DailySchedulesCard courses={courses} schedules={schedules} />
					<NotificationsListCard />
					<UpcomingAssignmentsCard />
					<AssignmentsProgressCard />
				</div>
			</div>
		</div>
	);
}
