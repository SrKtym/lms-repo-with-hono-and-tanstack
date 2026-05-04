import { AssignmentsProgressCard } from "@lms-repo/ui/components/cards/assignments-progress-card";
import { DailySchedulesCard } from "@lms-repo/ui/components/cards/daily-schedules-card";
import { NotificationsListCard } from "@lms-repo/ui/components/cards/notifications-list-card";
import { UpcomingAssignmentsCard } from "@lms-repo/ui/components/cards/upcoming-assignments-card";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
	useDeleteNotification,
	useMarkAllNotificationsAsRead,
	useMarkNotificationAsRead,
	useNotifications,
} from "@/hooks/notifications";
import { queryClient } from "@/lib/query-client";
import {
	fetchAssignmentsQueryFn,
	fetchNotificationsQueryFn,
	fetchRegisteredCoursesQueryFn,
	fetchSchedulesQueryFn,
} from "@/utils/query-utils";

export const Route = createFileRoute("/_my-page/dashboard")({
	component: RouteComponent,
	loader: async () => {
		// キャッシュがあればキャッシュからデータ取得（既にプリフェッチ済み）
		const [courses, schedules, assignments, initialNotifications] =
			await Promise.all([
				queryClient.ensureQueryData({
					queryKey: ["registered-courses"],
					queryFn: fetchRegisteredCoursesQueryFn,
					staleTime: 5 * 60 * 1000,
				}),

				queryClient.ensureQueryData({
					queryKey: ["schedules"],
					queryFn: fetchSchedulesQueryFn,
					staleTime: 5 * 60 * 1000,
				}),

				queryClient.ensureQueryData({
					queryKey: ["assignments-related-courses"],
					queryFn: fetchAssignmentsQueryFn,
					staleTime: 5 * 60 * 1000, // 5 minutes
				}),

				queryClient.ensureQueryData({
					queryKey: ["notifications"],
					queryFn: fetchNotificationsQueryFn,
					staleTime: 5 * 60 * 1000, // 5 minutes
				}),
			]);
		return { courses, schedules, assignments, initialNotifications };
	},
});

function RouteComponent() {
	const { courses, schedules, assignments, initialNotifications } =
		Route.useLoaderData();

	const { data: notifications = [] } = useNotifications(initialNotifications);
	const markAsRead = useMarkNotificationAsRead();
	const markAllAsRead = useMarkAllNotificationsAsRead();
	const deleteNotification = useDeleteNotification();

	// Memoize DailySchedulesCard props to prevent animation re-triggers
	const memoizedDailySchedulesProps = useMemo(() => ({
		courses,
		schedules,
	}), [courses, schedules]);

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
					<DailySchedulesCard {...memoizedDailySchedulesProps} />
					<UpcomingAssignmentsCard assignments={assignments} />
				</div>

				{/* Desktop Layout - Right Column */}
				<div className="hidden lg:block lg:space-y-6">
					<NotificationsListCard
						notifications={notifications}
						markAsRead={markAsRead.mutate}
						markAllAsRead={markAllAsRead.mutate}
						deleteNotification={deleteNotification.mutate}
					/>
					<AssignmentsProgressCard assignments={assignments} />
				</div>

				{/* Mobile Layout - Custom Order */}
				<div className="space-y-4 lg:hidden">
					<DailySchedulesCard {...memoizedDailySchedulesProps} />
					<NotificationsListCard
						notifications={notifications}
						markAsRead={markAsRead.mutate}
						markAllAsRead={markAllAsRead.mutate}
						deleteNotification={deleteNotification.mutate}
					/>
					<UpcomingAssignmentsCard assignments={assignments} />
					<AssignmentsProgressCard assignments={assignments} />
				</div>
			</div>
		</div>
	);
}
