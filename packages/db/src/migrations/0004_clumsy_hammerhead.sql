ALTER TABLE "announcements" ADD COLUMN "type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "type_check" CHECK ("announcements"."type" IN ('資料', 'アンケート', 'その他'));