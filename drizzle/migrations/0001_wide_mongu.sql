CREATE TABLE "common__config" (
	"module_name" text NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "common__config_module_name_key_pk" PRIMARY KEY("module_name","key")
);
