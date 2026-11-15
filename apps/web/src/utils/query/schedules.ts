import { parseDatesInArray } from "@lms-repo/ui/utils/datetime";
import { client } from "../../lib/hono-client";

// スケジュール取得用のqueryFn
export const fetchSchedulesQueryFn = async () => {
	const res = await client.api.schedules.$get();
	const data = await res.json();
	return parseDatesInArray(data, ["startTime", "endTime"]);
};
