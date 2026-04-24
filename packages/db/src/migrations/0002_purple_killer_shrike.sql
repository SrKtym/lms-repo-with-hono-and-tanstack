ALTER TABLE "schedules" ALTER COLUMN "description" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "schedules" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "schedules" ALTER COLUMN "theme" SET DEFAULT '#059669';--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_name_unique" UNIQUE("name");