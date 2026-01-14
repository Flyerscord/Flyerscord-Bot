#!/usr/bin/env node

/* -------------------------------------------------------------------------- */
/*                                   Imports                                  */
/* -------------------------------------------------------------------------- */
import ModuleManager from "@common/managers/ModuleManager";
import ConfigManager from "@common/managers/ConfigManager";
import SecretManager from "@common/managers/SecretManager";
import { ConfigCLI } from "@cli/lib/ConfigCLI";
import EnvManager from "@common/managers/EnvManager";

/* -------------------------------------------------------------------------- */
/*                                 Run Startup                                */
/* -------------------------------------------------------------------------- */
void main();

async function main(): Promise<void> {
  try {
    // Validate environment variables
    const envManager = EnvManager.getInstance();

    if (!envManager.read()) {
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
