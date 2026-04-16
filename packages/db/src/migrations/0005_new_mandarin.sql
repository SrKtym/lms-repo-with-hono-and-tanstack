CREATE TABLE "announcements" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"points" integer NOT NULL,
	"due_date" timestamp (0) NOT NULL,
	"format" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_submissions_metadata" (
	"id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"sender" text NOT NULL,
	"receiver" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text DEFAULT 'タイトルなし' NOT NULL,
	"description" text,
	"start_time" timestamp (0) NOT NULL,
	"end_time" timestamp (0) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"theme" text DEFAULT '#000000' NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submisson_status" (
	"user_id" text,
	"assignment_id" text,
	"is_submitted" boolean DEFAULT false NOT NULL,
	"score" integer,
	CONSTRAINT "submisson_status_user_id_assignment_id_pk" PRIMARY KEY("user_id","assignment_id"),
	CONSTRAINT "score_range" CHECK (("submisson_status"."is_submitted" = false AND "submisson_status"."score" IS NULL) OR 
        ("submisson_status"."is_submitted" = true AND "submisson_status"."score" >= 0 AND "submisson_status"."score" <= 100))
);
--> statement-breakpoint
CREATE TABLE "test_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "better_auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "better_auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "better_auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_submissions" ADD CONSTRAINT "test_submissions_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "better_auth"."user"("id") ON DELETE no action ON UPDATE no action;