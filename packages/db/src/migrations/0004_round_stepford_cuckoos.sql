CREATE SCHEMA "better_auth";
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"faculty_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculties" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registration" (
	"userid" text,
	"course_id" text,
	CONSTRAINT "registration_userid_course_id_pk" PRIMARY KEY("userid","course_id")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"user_id" text PRIMARY KEY NOT NULL,
	"grade" text NOT NULL,
	"department_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "passkeys" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "session" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "two_factors" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verification" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."account" SET SCHEMA "better_auth";
--> statement-breakpoint
ALTER TABLE "public"."passkeys" SET SCHEMA "better_auth";
--> statement-breakpoint
ALTER TABLE "public"."session" SET SCHEMA "better_auth";
--> statement-breakpoint
ALTER TABLE "public"."two_factors" SET SCHEMA "better_auth";
--> statement-breakpoint
ALTER TABLE "public"."user" SET SCHEMA "better_auth";
--> statement-breakpoint
ALTER TABLE "public"."verification" SET SCHEMA "better_auth";
--> statement-breakpoint
ALTER TABLE "service" RENAME TO "courses";--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "target_grade" text NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "credits" text NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "requirements" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "class_room" text NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "department_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "professor_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_faculty_id_faculties_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration" ADD CONSTRAINT "registration_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration" ADD CONSTRAINT "registration_userid_user_id_fk" FOREIGN KEY ("userid") REFERENCES "better_auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "better_auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_professor_id_user_id_fk" FOREIGN KEY ("professor_id") REFERENCES "better_auth"."user"("id") ON DELETE no action ON UPDATE no action;