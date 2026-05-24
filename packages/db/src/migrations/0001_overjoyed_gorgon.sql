ALTER TABLE "students" ALTER COLUMN "required_credits" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "assignment_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;