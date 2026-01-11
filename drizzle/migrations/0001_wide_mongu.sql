CREATE TABLE "common__config" (
	"module_name" text NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "common__config_module_name_key_pk" PRIMARY KEY("module_name","key")
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at on row changes
CREATE TRIGGER update_common__config_updated_at
    BEFORE UPDATE ON "common__config"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
