import { client } from "../../lib/hono-client";

// メール通知設定取得用のqueryFn
export const fetchEmailNotificationSettingsQueryFn = async () => {
	const res = await client.api.settings.email_notification.$get();
	const data = await res.json();
	return data;
};
