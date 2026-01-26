CREATE TABLE "joinleave__left_users" (
	"user_id" text PRIMARY KEY NOT NULL,
	"left_at" timestamp DEFAULT now() NOT NULL,
	"roles" text[] DEFAULT '{}' NOT NULL
);
