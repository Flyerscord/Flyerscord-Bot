#!/usr/bin/env node

/* -------------------------------------------------------------------------- */
/*                                   Imports                                  */
/* -------------------------------------------------------------------------- */
import Stumper, { LOG_LEVEL, TIMEZONE } from "stumper";
import Env from "@common/utils/Env";
import ModuleManager from "@common/managers/ModuleManager";
import ConfigManager from "@common/managers/ConfigManager";
import SecretManager from "@common/managers/SecretManager";
import { ConfigCLI } from "@cli/lib/ConfigCLI";

/* -------------------------------------------------------------------------- */
/*                                Initial Setup                               */
/* -------------------------------------------------------------------------- */
// Setup Stumper
Stumper.setConfig({ logLevel: LOG_LEVEL.ERROR, timezone: TIMEZONE.LOCAL, useColors: true });

/* -------------------------------------------------------------------------- */
/*                                 Run Startup                                */
/* -------------------------------------------------------------------------- */
void main();

async function main(): Promise<void> {
  try {
    // Validate environment variables
    const envErrors: string[] = [];

    const DATABASE_URL_POOLED = Env.get("DATABASE_URL_POOLED");
    if (!DATABASE_URL_POOLED) {
      envErrors.push("DATABASE_URL_POOLED");
    }

    const ENCRYPTION_KEY = Env.get("ENCRYPTION_KEY");
    if (!ENCRYPTION_KEY) {
      envErrors.push("ENCRYPTION_KEY");
    }

    if (envErrors.length > 0) {
      console.error(`Missing environment variables: ${envErrors.join(", ")}`);
      console.error("Please ensure all required environment variables are set.");
      process.exit(1);
    }

    // Initialize managers
    const moduleManager = ModuleManager.getInstance();
    const configManager = ConfigManager.getInstance();
    SecretManager.getInstance();

    // Add all modules
    moduleManager.addAllModules();

    // Register all modules (this registers config schemas)
    await moduleManager.registerAllModules();

    // Load config from database
    await configManager.refreshConfig();

    // Run the CLI
    const cli = new ConfigCLI();
    await cli.run(process.argv);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}
