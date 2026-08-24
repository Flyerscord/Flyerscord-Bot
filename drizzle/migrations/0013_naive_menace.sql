CREATE TYPE "public"."fantasy__season_status_type" AS ENUM('open', 'closing', 'pending_approval', 'closed');--> statement-breakpoint
CREATE TYPE "public"."fantasy__skill_level_type" AS ENUM('Beginner', 'Intermediate', 'Expert');--> statement-breakpoint
CREATE TABLE "fantasy__commissioner_signups" (
	"id" serial PRIMARY KEY NOT NULL,
	"season_id" integer NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"signed_up_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fantasy_commissioner_signups_season_id_user_id_unique" UNIQUE("season_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "fantasy__seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"signup_deadline" timestamp NOT NULL,
	"status" "fantasy__season_status_type" DEFAULT 'open' NOT NULL,
	"signup_message_id" varchar(255),
	"signup_channel_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "fantasy__signups" (
	"id" serial PRIMARY KEY NOT NULL,
	"season_id" integer NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"skill_level" "fantasy__skill_level_type" NOT NULL,
	"assigned_team_number" integer,
	"signed_up_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fantasy_signups_season_id_user_id_unique" UNIQUE("season_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "fantasy__team_names" (
	"id" serial PRIMARY KEY NOT NULL,
	"season_id" integer NOT NULL,
	"skill_level" "fantasy__skill_level_type" NOT NULL,
	"team_number" integer NOT NULL,
	"custom_name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fantasy_team_names_season_id_skill_level_team_number_unique" UNIQUE("season_id","skill_level","team_number")
);
--> statement-breakpoint
ALTER TABLE "fantasy__commissioner_signups" ADD CONSTRAINT "fantasy__commissioner_signups_season_id_fantasy__seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."fantasy__seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy__signups" ADD CONSTRAINT "fantasy__signups_season_id_fantasy__seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."fantasy__seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy__team_names" ADD CONSTRAINT "fantasy__team_names_season_id_fantasy__seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."fantasy__seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fantasy_signups_season_id_skill_level_idx" ON "fantasy__signups" USING btree ("season_id","skill_level");