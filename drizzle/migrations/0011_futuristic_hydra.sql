-- Migrate config values from GameDayPosts module to NHL module
INSERT INTO "common__config" ("module_name", "key", "value", "updated_at")
SELECT 'NHL', "key", "value", "updated_at"
FROM "common__config"
WHERE "module_name" = 'GameDayPosts'
ON CONFLICT ("module_name", "key") DO UPDATE
SET
	"value" = EXCLUDED."value",
	"updated_at" = EXCLUDED."updated_at";
--> statement-breakpoint
DELETE FROM "common__config"
WHERE "module_name" = 'GameDayPosts';
--> statement-breakpoint
CREATE TABLE "nhl__live_data" (
	"id" integer PRIMARY KEY NOT NULL,
	"game_id" integer,
	"game_start_time" timestamp,
	"current_period" integer
);
--> statement-breakpoint
ALTER TABLE "gamedayposts__posts" RENAME TO "nhl__posts";--> statement-breakpoint
DROP INDEX "gamedayposts_channel_id_idx";--> statement-breakpoint
CREATE INDEX "nhl_channel_id_idx" ON "nhl__posts" USING btree ("channel_id");
