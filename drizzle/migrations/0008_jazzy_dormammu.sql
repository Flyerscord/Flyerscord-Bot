CREATE TABLE "joinleave__state" (
	"key" text PRIMARY KEY NOT NULL,
	"boolean_value" boolean NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
