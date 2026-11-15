import { parseDatesInArray } from "@lms-repo/ui/utils/datetime";
import { client } from "@/lib/hono-client";

// 画面（ダッシュボード）単位でDTOを返すqueryFn
export const fetchDashboardSummaryQueryFn = async () => {
	const res = await client.api.dashboard.summary.$get();
	const data = await res.json();
	return {
		...data,
		schedules: parseDatesInArray(data.schedules, ["startTime", "endTime"]),
		notifications: parseDatesInArray(data.notifications, ["createdAt"]),
		assignments: parseDatesInArray(data.assignments, ["dueDate"]),
	};
};
