import { db } from "../../index";
import { emailNotificationSettings } from "../../schema";
import type { EmailNotificationSettings } from "../../types";
import { fail, ok } from "./helpers";

// メール通知設定の更新
export async function updateEmailNotificationSettings(
	settings: EmailNotificationSettings,
) {
	try {
		await db
			.insert(emailNotificationSettings)
			.values(settings)
			.onConflictDoUpdate({
				target: emailNotificationSettings.userId,
				set: {
					announcementsEmail: settings.announcementsEmail,
					assignmentsEmail: settings.assignmentsEmail,
					submissionsEmail: settings.submissionsEmail,
					evaluationsEmail: settings.evaluationsEmail,
					remindersEmail: settings.remindersEmail,
				},
			});
		return ok("メール通知設定を更新しました。", 200);
	} catch {
		return fail("メール通知設定の更新に失敗しました。", 500);
	}
}
