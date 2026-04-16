ALTER TABLE "registration" RENAME COLUMN "userid" TO "user_id";--> statement-breakpoint
ALTER TABLE "students" RENAME COLUMN "user_id" TO "id";--> statement-breakpoint
ALTER TABLE "registration" DROP CONSTRAINT "registration_userid_user_id_fk";
--> statement-breakpoint
ALTER TABLE "students" DROP CONSTRAINT "students_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "registration" DROP CONSTRAINT "registration_userid_course_id_pk";--> statement-breakpoint
ALTER TABLE "registration" ADD CONSTRAINT "registration_user_id_course_id_pk" PRIMARY KEY("user_id","course_id");--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "created_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "weekdays" text NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "period" text NOT NULL;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "better_auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration" ADD CONSTRAINT "registration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "better_auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_id_user_id_fk" FOREIGN KEY ("id") REFERENCES "better_auth"."user"("id") ON DELETE no action ON UPDATE no action;