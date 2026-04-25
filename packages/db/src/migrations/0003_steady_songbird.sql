CREATE TABLE "professors" (
	"id" text PRIMARY KEY NOT NULL,
	"department_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assignments" ADD COLUMN "course_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "professors" ADD CONSTRAINT "professors_id_user_id_fk" FOREIGN KEY ("id") REFERENCES "better_auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professors" ADD CONSTRAINT "professors_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;