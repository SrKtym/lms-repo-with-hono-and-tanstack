import { db } from "../../index";
import { notifications } from "../../schema";

export async function fetchNotifications() {
	const notificationsList = await db.select().from(notifications);
	return notificationsList;
}

export type FetchNotificationsReturnType = Awaited<
	ReturnType<typeof fetchNotifications>
>;
