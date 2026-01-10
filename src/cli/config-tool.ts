#!/usr/bin/env node

/* -------------------------------------------------------------------------- */
/*                                   Imports                                  */
/* -------------------------------------------------------------------------- */
import Stumper, { LOG_LEVEL, TIMEZONE } from "stumper";
import Env from "../common/utils/Env.js";
import ModuleManager from "../common/managers/ModuleManager.js";
import ConfigManager from "../common/managers/ConfigManager.js";
import SecretManager from "../common/managers/SecretManager.js";
import { ConfigCLI } from "./lib/ConfigCLI.js";

// Import all modules to register their config schemas
import CommonModule from "../common/CommonModule.js";
import AdminModule from "../modules/admin/AdminModule.js";
import BlueSkyModule from "../modules/bluesky/BlueSkyModule.js";
import CustomCommandsModule from "../modules/customCommands/CustomCommandsModule.js";
import DaysUntilModule from "../modules/daysUntil/DaysUntilModule.js";
import GameDayPostsModule from "../modules/gamedayPosts/GameDayPostsModule.js";
import HealthCheckModule from "../modules/healthcheck/HealthCheckModule.js";
import ImageProxyModule from "../modules/imageProxy/ImageProxyModule.js";
import JoinLeaveModule from "../modules/joinLeave/JoinLeaveModule.js";
import LevelsModule from "../modules/levels/LevelsModule.js";
import MiscModule from "../modules/misc/MiscModule.js";
import NHLModule from "../modules/nhl/NHLModule.js";
import PinsModule from "../modules/pins/PinsModule.js";
import PlayerEmojisModule from "../modules/playerEmojis/PlayerEmojisModule.js";
import ReactionRoleModule from "../modules/reactionRole/ReactionRoleModule.js";
import RegisterCommandsModule from "../modules/registerCommands/RegisterCommandsModule.js";
import RulesModule from "../modules/rules/RulesModule.js";
import StatsVoiceChannelModule from "../modules/statsVoiceChannel/StatsVoiceChannelModule.js";
import VisitorRoleModule from "../modules/visitorRole/VisitorRoleModule.js";

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

    const DATABASE_URL_SINGLE = Env.get("DATABASE_URL_SINGLE");
    if (!DATABASE_URL_SINGLE) {
      envErrors.push("DATABASE_URL_SINGLE");
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

    // Add all modules (same order as bot.ts)
    moduleManager.addModule(CommonModule.getInstance());
    moduleManager.addModule(HealthCheckModule.getInstance());
    moduleManager.addModule(AdminModule.getInstance());
    moduleManager.addModule(BlueSkyModule.getInstance());
    moduleManager.addModule(CustomCommandsModule.getInstance());
    moduleManager.addModule(DaysUntilModule.getInstance());
    moduleManager.addModule(GameDayPostsModule.getInstance());
    moduleManager.addModule(ImageProxyModule.getInstance());
    moduleManager.addModule(JoinLeaveModule.getInstance());
    moduleManager.addModule(LevelsModule.getInstance());
    moduleManager.addModule(MiscModule.getInstance());
    moduleManager.addModule(NHLModule.getInstance());
    moduleManager.addModule(PinsModule.getInstance());
    moduleManager.addModule(PlayerEmojisModule.getInstance());
    moduleManager.addModule(ReactionRoleModule.getInstance());
    moduleManager.addModule(RegisterCommandsModule.getInstance());
    moduleManager.addModule(RulesModule.getInstance());
    moduleManager.addModule(StatsVoiceChannelModule.getInstance());
    moduleManager.addModule(VisitorRoleModule.getInstance());

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
