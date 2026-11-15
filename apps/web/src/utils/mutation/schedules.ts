import type { Schedules } from "@lms-repo/db/types";
import { client } from "@/lib/hono-client";

// スケジュールを作成するmutationFn
export const createScheduleMutationFn = async (
	scheduleData: Omit<Schedules, "createdBy">,
) => {
	const res = await client.api.schedules.$post({
		json: scheduleData,
	});
	const data = await res.json();
	return data;
};

// スケジュールを削除するmutationFn
export const deleteScheduleMutationFn = async (scheduleId: string) => {
	const res = await client.api.schedules[":schedule-id"].$delete({
		param: {
			"schedule-id": scheduleId,
		},
	});
	const data = await res.json();
	return data;
};
