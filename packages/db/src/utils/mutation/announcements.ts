import { eq } from "drizzle-orm";
import { db } from "../../index";
import { announcements } from "../../schema";
import type { Announcements } from "../../types";

export async function createAnnouncements(announcementsData: Announcements) {
	try {
		await db.insert(announcements).values(announcementsData);
		return { message: "アナウンスメントの作成に成功しました。", status: 201 };
	} catch {
		return { message: "アナウンスメントの作成に失敗しました。", status: 500 };
	}
}

export async function updateAnnouncements(announcementsData: Announcements) {
	try {
		await db.update(announcements).set(announcementsData);
		return { message: "アナウンスメントの更新に成功しました。", status: 200 };
	} catch {
		return { message: "アナウンスメントの更新に失敗しました。", status: 500 };
	}
}

export async function deleteAnnouncements(id: string) {
	try {
		await db.delete(announcements).where(eq(announcements.id, id));
		return { message: "アナウンスメントの削除に成功しました。", status: 200 };
	} catch {
		return { message: "アナウンスメントの削除に失敗しました。", status: 500 };
	}
}
