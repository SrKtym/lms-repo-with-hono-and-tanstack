import { db } from "../../index";
import { notifications } from "../../schema";
import type { Notifications } from "../../types";

export async function createNotifications(notificationsData: Notifications) {
	const notificationsList = await db.insert(notifications).values(notificationsData);
	return notificationsList;
}