import { db } from "../../index";
import { comments } from "../../schema";
import type { Comments } from "../../types";
import { fail, ok } from "./helpers";

// コメント作成
export async function createComments(commentsData: Comments) {
	try {
		await db.insert(comments).values(commentsData);
		return ok("コメントの作成に成功しました。", 201);
	} catch {
		return fail("コメントの作成に失敗しました。", 500);
	}
}
