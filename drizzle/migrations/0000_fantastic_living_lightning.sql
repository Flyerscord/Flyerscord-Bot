CREATE TYPE "public"."common__audit_log_severity_type" AS ENUM('INFO', 'WARNING', 'ERROR');--> statement-breakpoint
CREATE TYPE "public"."rules__section_type" AS ENUM('HEADER', 'CONTENT');--> statement-breakpoint
CREATE TABLE "common__audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"module_name" text NOT NULL,
	"action" text NOT NULL,
	"user_id" text,
	"details" jsonb,
	"severity" "common__audit_log_severity_type" DEFAULT 'INFO' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bluesky__state" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"date" timestamp,
	"value" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customcommands__commands" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"text" text NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"created_on" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customcommands__commands_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "customcommands__state" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"message_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daysuntil__dates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"date" timestamp,
	"enabled" boolean DEFAULT false NOT NULL,
	CONSTRAINT "daysuntil__dates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "gamedayposts__posts" (
	"game_id" integer PRIMARY KEY NOT NULL,
	"channel_id" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "levels__levels" (
	"user_id" varchar(255) PRIMARY KEY NOT NULL,
	"total_experience" integer NOT NULL,
	"current_level" integer NOT NULL,
	"message_count" integer NOT NULL,
	"time_of_last_message" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "levels__levels_experience" (
	"level_number" integer PRIMARY KEY NOT NULL,
	"experience" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pins__pins" (
	"og_message_id" varchar(255) PRIMARY KEY NOT NULL,
	"og_created_at" timestamp NOT NULL,
	"og_channel_id" varchar(255) NOT NULL,
	"message_id" varchar(255),
	"pinned_by" varchar(255) NOT NULL,
	"pinned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playeremojis__emojis" (
	"player_id" integer PRIMARY KEY NOT NULL,
	"emoji_id" varchar NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reactionrole__messages" (
	"name" varchar(255) PRIMARY KEY NOT NULL,
	"message_id" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rules__messages" (
	"message_id" varchar(255) PRIMARY KEY NOT NULL,
	"index" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rules__section_messages" (
	"message_id" varchar(255) PRIMARY KEY NOT NULL,
	"section_id" varchar(255) NOT NULL,
	"type" "rules__section_type" NOT NULL,
	"url" varchar(255),
	"content" text,
	CONSTRAINT "type_constraint" CHECK (("rules__section_messages"."type" = 'HEADER'::rules__section_type AND "rules__section_messages"."url" IS NOT NULL AND "rules__section_messages"."content" IS NULL) OR ("rules__section_messages"."type" = 'CONTENT'::rules__section_type AND "rules__section_messages"."content" IS NOT NULL AND "rules__section_messages"."url" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "rules__sections" (
	"name" varchar(255) PRIMARY KEY NOT NULL,
	"friendly_name" varchar(255) NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rules__state" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visitorrole__state" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"value" varchar(255) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rules__section_messages" ADD CONSTRAINT "rules__section_messages_message_id_rules__messages_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."rules__messages"("message_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rules__section_messages" ADD CONSTRAINT "rules__section_messages_section_id_rules__sections_name_fk" FOREIGN KEY ("section_id") REFERENCES "public"."rules__sections"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_module_name_idx" ON "common__audit_log" USING btree ("module_name");--> statement-breakpoint
CREATE INDEX "audit_log_timestamp_idx" ON "common__audit_log" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "audit_log_user_id_idx" ON "common__audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_log_module_timestamp_idx" ON "common__audit_log" USING btree ("module_name","timestamp");