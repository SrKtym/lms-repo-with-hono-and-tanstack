import { client } from "@/lib/hono-client";
import { useMutation } from "@tanstack/react-query";

// 指定された通知を既読にするカスタムフック
export const useMarkNotificationAsRead = () => {
	return useMutation({
		mutationFn: async (notificationId: string) => {
			const res = await client.api.notifications[":id"].mark_as_read.$patch({
				param: {
					id: notificationId,
				},
			});
			const data = await res.json();
			return data;
		},
	});
};