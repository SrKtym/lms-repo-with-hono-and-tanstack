import type { EmailNotificationSettings } from "@lms-repo/db/types";
import { client } from "@/lib/hono-client";

// メール通知設定を更新するmutationFn
export const updateEmailNotificationSettingsMutationFn = async (
	settings: Omit<EmailNotificationSettings, "userId">,
) => {
	const res = await client.api.settings.email_notification.$post({
		json: settings,
	});
	const data = await res.json();
	return data;
};
