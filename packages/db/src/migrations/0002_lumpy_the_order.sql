ALTER TABLE "courses" DROP CONSTRAINT "courses_professor_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_professor_id_professors_id_fk" FOREIGN KEY ("professor_id") REFERENCES "public"."professors"("id") ON DELETE cascade ON UPDATE no action;