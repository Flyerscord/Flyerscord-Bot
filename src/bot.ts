/* -------------------------------------------------------------------------- */
/*                                   Imports                                  */
/* -------------------------------------------------------------------------- */
// Import External Libraries
import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import Stumper, { LOG_LEVEL, TIMEZONE } from "stumper";

// Import Error Handling
import processErrorHandling from "@common/listeners/processErrorHandling";
import discordErrorHandling from "@common/listeners/discordErrorHandling";
import discordConnectionHandling from "@common/listeners/discordConnectionHandling";
import onSigInt from "@common/listeners/onSigInt";

// Import Managers
import ClientManager from "@common/managers/ClientManager";
import ConfigManager from "@common/managers/ConfigManager";
import SlashCommandManager from "@common/managers/SlashCommandManager";
import TextCommandManager from "@common/managers/TextCommandManager";
import ContextMenuCommandManager from "@common/managers/ContextMenuManager";
import ModalMenuManager from "@common/managers/ModalMenuManager";
import ModuleManager from "@common/managers/ModuleManager";
import BotHealthManager from "@common/managers/BotHealthManager";
import SecretManager from "./common/managers/SecretManager";

// Import Other Internal Things
import Env from "@common/utils/Env";
import CombinedTeamInfoCache from "./common/cache/CombinedTeamInfoCache";
import onMessageCreate from "@common/listeners/onMessageCreate";
import onInteractionCreate from "@common/listeners/onInteractionCreate";
import onReady from "@common/listeners/onReady";
import MyAuditLog from "./common/utils/AuditLog";
import Database from "./common/db/db";

/* -------------------------------------------------------------------------- */
/*                                Initial Setup                               */
/* -------------------------------------------------------------------------- */
// Setup Stumper
Stumper.setConfig({ logLevel: LOG_LEVEL.ALL, timezone: TIMEZONE.LOCAL, useColors: true });

// Setup Basic Error Handling
processErrorHandling();
onSigInt();

/* -------------------------------------------------------------------------- */
/*                                 Run Startup                                */
/* -------------------------------------------------------------------------- */
// Gives top level async
void startUp();

async function startUp(): Promise<void> {
  let envErrors: string[] = [];
  // Validate the environment variables
  const DISCORD_TOKEN = Env.get("DISCORD_TOKEN");
  if (!DISCORD_TOKEN) {
    envErrors.push("DISCORD_TOKEN");
  }

  const DATABASE_URL_POOLED = Env.get("DATABASE_URL_POOLED");
  if (!DATABASE_URL_POOLED) {
    envErrors.push("DATABASE_URL_POOLED");
  }

  const ENCRYPTION_KEY = Env.get("ENCRYPTION_KEY");
  if (!ENCRYPTION_KEY) {
    envErrors.push("ENCRYPTION_KEY");
  }

  const PRODUCTION_MODE = Env.getBoolean("PRODUCTION_MODE");
  if (PRODUCTION_MODE === undefined) {
    envErrors.push("PRODUCTION_MODE");
  }

  const ADVANCED_DEBUG = Env.getBoolean("ADVANCED_DEBUG");
  if (ADVANCED_DEBUG === undefined) {
    envErrors.push("ADVANCED_DEBUG");
  }

  if (envErrors.length > 0) {
    Stumper.error(`Missing environment variables: ${envErrors.join(", ")}`, "main:startUp");
    return;
  }

  Stumper.info(
    `Bot starting up in ${PRODUCTION_MODE ? "production" : "development"} mode! Advanced debug: ${ADVANCED_DEBUG ? "enabled" : "disabled"}`,
    "main:startUp",
  );

  // Initalize Database
  Database.getInstance();

  // Initialize the Module Manager
  const moduleManager = ModuleManager.getInstance();

  // Initialize the Config Manager
  const configManager = ConfigManager.getInstance();

  // Initialize the Secret Manager
  SecretManager.getInstance();

  // Initialize the Bot Health Manager
  BotHealthManager.getInstance();

  // Add all of the modules (in order of load priority)
  moduleManager.addAllModules();

  // Disable any modules that you don't want to run with (none by default)
  // moduleManager.disableModule("Admin");

  // Register all modules
  await moduleManager.registerAllModules();

  // Load the config
  await configManager.refreshConfig();

  // Get the common config
  const commonConfig = configManager.getConfig("Common");

  // Config Stumper based on the config
  Stumper.setConfig({ logLevel: commonConfig.logLevel, timezone: TIMEZONE.LOCAL, useColors: true });

  // Create Discord Client
  const client = new Client({
    intents: [
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Message, Partials.Reaction, Partials.User, Partials.Channel],
  });

  // Setup Collections for Commands
  client.slashCommands = new Collection();
  client.textCommands = new Collection();
  client.modals = new Collection();
  client.contextMenus = new Collection();

  // Setup Discord Error Handling
  discordErrorHandling(client);
  discordConnectionHandling(client);

  // Initialize Other Managers
  ClientManager.getInstance(client);
  SlashCommandManager.getInstance();
  ContextMenuCommandManager.getInstance();
  ModalMenuManager.getInstance();
  TextCommandManager.getInstance();

  // Update Caches
  await CombinedTeamInfoCache.getInstance().forceUpdate();

  // Enable All Modules
  const result = await moduleManager.enableAllModules();
  if (result) {
    Stumper.success("Successfully enabled all modules!", "main:startUp");
  } else {
    Stumper.warning("Failed to enable all modules! Check the logs above for more details.", "main:startUp");
  }

  // Register Common Event Handlers
  onMessageCreate(client);
  onInteractionCreate(client);
  onReady(client);

  // Add Audit Log for Bot Startup
  await MyAuditLog.createAuditLog("Common", {
    action: "BotStartup",
  });

  // Start the bot
  await client.login(DISCORD_TOKEN);
}
