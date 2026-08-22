import { client } from "@/lib/hono-client";

// 通知を既読にするmutationFn
export const markNotificationAsReadMutationFn = async (
	notificationId?: string,
) => {
	if (notificationId) {
		const res = await client.api.students.notifications.mark_as_read.$patch({
			json: {
				notificationId,
			},
		});
		const data = await res.json();
		return data;
	}
	// 全通知を既読にするmutationFn
	const res = await client.api.students.notifications.mark_all_as_read.$patch();
	const data = await res.json();
	return data;
};

// 通知を削除するmutationFn
export const deleteNotificationMutationFn = async (notificationId?: string) => {
	if (notificationId) {
		const res = await client.api.students.notifications.$delete({
			json: {
				notificationId,
			},
		});
		const data = await res.json();
		return data;
	}
	// 全通知を削除するmutationFn
	const res = await client.api.students.notifications.all.$delete();
	const data = await res.json();
	return data;
};
