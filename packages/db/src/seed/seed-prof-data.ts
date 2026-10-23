import { db } from "..";
import { mockProfessors } from "../mock/mock-prof-data";
import { user } from "../schema";

// 教員データをシードする関数
export async function seedUserData() {
	await db.insert(user).values(mockProfessors).onConflictDoNothing();
}
