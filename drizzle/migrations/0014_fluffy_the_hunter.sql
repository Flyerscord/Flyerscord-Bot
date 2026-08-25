CREATE TABLE "tickets__button_messages" (
	"type" text PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"message_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets__tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"encrypted_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
