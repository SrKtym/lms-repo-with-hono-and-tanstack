import { db } from "../../index";
import { comments } from "../../schema";
import type { Comments } from "../../types";

export async function createComments(commentsData: Comments) {
	const commentsList = await db.insert(comments).values(commentsData);
	return commentsList;
}