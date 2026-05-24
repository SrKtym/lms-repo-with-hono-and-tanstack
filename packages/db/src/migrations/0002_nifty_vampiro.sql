CREATE TABLE "email_notification_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"announcements_email" boolean DEFAULT false NOT NULL,
	"assignments_email" boolean DEFAULT false NOT NULL,
	"submissions_email" boolean DEFAULT false NOT NULL,
	"evaluations_email" boolean DEFAULT false NOT NULL,
	"reminders_email" boolean DEFAULT false NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "file_submissions_metadata" ADD COLUMN "bucket" text NOT NULL;--> statement-breakpoint
ALTER TABLE "file_submissions_metadata" ADD COLUMN "object_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "file_submissions_metadata" ADD COLUMN "original_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "file_submissions_metadata" ADD COLUMN "mime_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "file_submissions_metadata" ADD COLUMN "file_size" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "file_submissions_metadata" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "file_submissions_metadata" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "file_submissions_metadata" ADD COLUMN "created_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "email_notification_settings" ADD CONSTRAINT "email_notification_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "better_auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_notification_settings_user_id_idx" ON "email_notification_settings" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "file_submissions_metadata" ADD CONSTRAINT "file_submissions_metadata_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "better_auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "file_submissions_metadata_created_by_idx" ON "file_submissions_metadata" USING btree ("created_by");