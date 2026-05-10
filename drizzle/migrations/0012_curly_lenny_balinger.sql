DROP INDEX "joinleave_timedout_at_idx";--> statement-breakpoint
ALTER TABLE "joinleave__not_verified_users" DROP COLUMN "timedout_at";