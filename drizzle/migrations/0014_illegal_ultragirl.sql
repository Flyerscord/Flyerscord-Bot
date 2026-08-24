CREATE TABLE "predictions__predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"season" integer NOT NULL,
	"predicted_home_score" integer NOT NULL,
	"predicted_away_score" integer NOT NULL,
	"actual_home_score" integer,
	"actual_away_score" integer,
	"points_awarded" integer,
	"resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "predictions_predictions_game_id_user_id_unique" UNIQUE("game_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "predictions__state" (
	"id" integer PRIMARY KEY NOT NULL,
	"game_id" integer,
	"season" integer,
	"game_start_time" timestamp
);
--> statement-breakpoint
CREATE INDEX "predictions_predictions_season_idx" ON "predictions__predictions" USING btree ("season");--> statement-breakpoint
CREATE INDEX "predictions_predictions_user_id_idx" ON "predictions__predictions" USING btree ("user_id");