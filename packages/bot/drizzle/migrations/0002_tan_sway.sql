ALTER TYPE "public"."common__audit_log_severity_type" ADD VALUE 'CRITICAL' BEFORE 'ERROR';--> statement-breakpoint
CREATE TABLE "joinleave__not_verified_users" (
	"user_id" text PRIMARY KEY NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"questions_answered" integer DEFAULT 0 NOT NULL,
	"lock" boolean DEFAULT false NOT NULL,
	"incorrect_answers" integer DEFAULT 0 NOT NULL,
	"timedout_at" timestamp,
	"time_out_count" integer DEFAULT 0 NOT NULL
);
