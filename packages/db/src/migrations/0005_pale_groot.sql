ALTER TABLE "registration" DROP CONSTRAINT "registration_user_id_course_id_pk";--> statement-breakpoint
ALTER TABLE "registration" ADD COLUMN "id" text PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "registration" ADD CONSTRAINT "registration_user_id_course_id_unique" UNIQUE("user_id","course_id");