import { client } from "@/lib/hono-client";

// 通知を既読にするmutationFn
export const markNotificationAsReadMutationFn = async (
	notificationId?: string,
) => {
	if (notificationId) {
		const res = await client.api.students.notifications[":notification-id"][
			"mark-as-read"
		].$patch({
			param: {
				"notification-id": notificationId,
			},
		});
		const data = await res.json();
		return data;
	}
	// 全通知を既読にするmutationFn
	const res = await client.api.students.notifications["mark-as-read"].$patch();
	const data = await res.json();
	return data;
};

// 通知を削除するmutationFn
export const deleteNotificationMutationFn = async (notificationId?: string) => {
	const res = await client.api.students.notifications[
		":notification-id?"
	].$delete({
		param: {
			"notification-id": notificationId,
		},
	});
	const data = await res.json();
	return data;
};
