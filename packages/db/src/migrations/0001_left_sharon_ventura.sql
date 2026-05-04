ALTER TABLE "assignments" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "text_submissions" ALTER COLUMN "description" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "text_submissions" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "announcements_course_id_idx" ON "announcements" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "assignments_course_id_idx" ON "assignments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "comments_created_by_idx" ON "comments" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "courses_department_id_idx" ON "courses" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "courses_professor_id_idx" ON "courses" USING btree ("professor_id");--> statement-breakpoint
CREATE INDEX "courses_weekdays_period_idx" ON "courses" USING btree ("weekdays","period");--> statement-breakpoint
CREATE INDEX "departments_faculty_id_idx" ON "departments" USING btree ("faculty_id");--> statement-breakpoint
CREATE INDEX "notifications_receiver_is_read_idx" ON "notifications" USING btree ("receiver","is_read");--> statement-breakpoint
CREATE INDEX "professors_department_id_idx" ON "professors" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "registration_course_id_idx" ON "registration" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "schedules_created_by_idx" ON "schedules" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "students_department_id_idx" ON "students" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "text_submissions_created_by_idx" ON "text_submissions" USING btree ("created_by");