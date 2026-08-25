CREATE TYPE "public"."usermanagement__moderation_event_type" AS ENUM('BAN', 'UNBAN', 'KICK');--> statement-breakpoint
CREATE TABLE "usermanagement__moderation_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"type" "usermanagement__moderation_event_type" NOT NULL,
	"moderator_id" varchar(255),
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usermanagement__notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"added_by" varchar(255) NOT NULL,
	"note" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usermanagement__warnings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"warned_by" varchar(255) NOT NULL,
	"reason" text NOT NULL,
	"message_id" varchar(255),
	"channel_id" varchar(255),
	"message_content" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "usermanagement_moderation_events_user_id_idx" ON "usermanagement__moderation_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "usermanagement_moderation_events_created_at_idx" ON "usermanagement__moderation_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "usermanagement_notes_user_id_idx" ON "usermanagement__notes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "usermanagement_notes_created_at_idx" ON "usermanagement__notes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "usermanagement_warnings_user_id_idx" ON "usermanagement__warnings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "usermanagement_warnings_created_at_idx" ON "usermanagement__warnings" USING btree ("created_at");