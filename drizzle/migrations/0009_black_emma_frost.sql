CREATE TABLE "claimrole__allowlist" (
	"discord_user_id" text PRIMARY KEY NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL
);
