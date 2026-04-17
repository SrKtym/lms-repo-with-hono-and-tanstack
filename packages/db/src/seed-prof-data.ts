import { db } from ".";
import { mockProfessors } from "./mock-prof-data";
import { user } from "./schema";

export async function seedUserData() {
	await db.insert(user).values(mockProfessors);
}
