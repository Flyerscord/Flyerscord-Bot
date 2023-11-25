import { Client, Collection, GatewayIntentBits } from "discord.js";

import Config from "./config/Config";

import ready from "./listeners/ready";
import errorHanding from "./listeners/errorHanding";
import { calculateLevels } from "./util/levels/requiredExp";

import Logger from "stumper";

// Check if the config file exists
if (!Config.fileExists()) {
  Logger.error(
    "Config file not found! Rename src/config/sample.config.json to config.json and enter the required information!",
    "main"
  );
  process.exit(1);
}

// Create Discord.js client and set our intents
const client = new Client({
  intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.slashCommands = new Collection();
client.textCommands = new Collection();

// Register our important event handlers
// Others will be dynamically loaded in the ready listener
errorHanding(client);
ready(client);

// Generate the levels table if needed
calculateLevels(1000);

// Use our token to connect to the connect
client.login(Config.getConfig().token);
