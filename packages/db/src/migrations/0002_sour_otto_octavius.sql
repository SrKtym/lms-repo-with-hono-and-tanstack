CREATE TABLE "user_notifications" (
	"user_id" text NOT NULL,
	"notification_id" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_notifications_user_id_notification_id_pk" PRIMARY KEY("user_id","notification_id")
);
--> statement-breakpoint
DROP INDEX "notifications_sender_idx";--> statement-breakpoint
DROP INDEX "notifications_receiver_is_read_idx";--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "better_auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "sender";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "receiver";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "is_read";--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "type_check" CHECK ("notifications"."type" IN ('announcement','assignment','system'));