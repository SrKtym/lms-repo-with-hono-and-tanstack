ALTER TABLE "test_submissions" RENAME TO "text_submissions";--> statement-breakpoint
ALTER TABLE "text_submissions" DROP CONSTRAINT "test_submissions_created_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "text_submissions" ADD CONSTRAINT "text_submissions_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "better_auth"."user"("id") ON DELETE no action ON UPDATE no action;