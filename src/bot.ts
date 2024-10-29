/* -------------------------------------------------------------------------- */
/*                                Setup Stumper                                */
/* -------------------------------------------------------------------------- */
import Stumper, { LOG_LEVEL } from "stumper";
Stumper.setConfig({ logLevel: LOG_LEVEL.ALL });

/* -------------------------------------------------------------------------- */
/*                        Setup Process Error Handling                        */
/* -------------------------------------------------------------------------- */
import processErrorHandling from "./common/listeners/processErrorHandling.js";

processErrorHandling();

/* -------------------------------------------------------------------------- */
/*                                Check Config                                */
/* -------------------------------------------------------------------------- */
import Config from "./common/config/Config.js";

if (!Config.fileExists()) {
  Stumper.error("Config file not found", "main");
  process.exit(1);
}

Stumper.setConfig({ logLevel: Config.getConfig().logLevel });

/* -------------------------------------------------------------------------- */
/*                            Create Discord Client                           */
/* -------------------------------------------------------------------------- */
import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";

const client = new Client({
  intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
  partials: [Partials.Message, Partials.Reaction, Partials.User],
});

/* -------------------------------------------------------------------------- */
/*                        Setup Discord Error Handling                        */
/* -------------------------------------------------------------------------- */
import discordErrorHandling from "./common/listeners/discordErrorHandling.js";

discordErrorHandling(client);

/* -------------------------------------------------------------------------- */
/*                       Setup Collections for commands                       */
/* -------------------------------------------------------------------------- */
client.slashCommands = new Collection();
client.textCommands = new Collection();
client.modals = new Collection();
client.contextMenus = new Collection();

/* -------------------------------------------------------------------------- */
/*                               Setup Managers                               */
/* -------------------------------------------------------------------------- */
import ClientManager from "./common/managers/ClientManager.js";
import SlashCommandManager from "./common/managers/SlashCommandManager.js";
import TextCommandManager from "./common/managers/TextCommandManager.js";
import ContextMenuCommandManager from "./common/managers/ContextMenuManager.js";
import ModalMenuManager from "./common/managers/ModalMenuManager.js";

ClientManager.getInstance(client);
TextCommandManager.getInstance();
SlashCommandManager.getInstance();
ContextMenuCommandManager.getInstance();
ModalMenuManager.getInstance();

/* -------------------------------------------------------------------------- */
/*                              Register Modules                              */
/* -------------------------------------------------------------------------- */
import AdminModule from "./modules/admin/AdminModule.js";
import CustomCommandsModule from "./modules/customCommands/CustomCommandsModule.js";
import DaysUntilModule from "./modules/daysUntil/DaysUntilModule.js";
import GameDayPostsModule from "./modules/gamedayPosts/GameDayPostsModule.js";
import JoinLeaveModule from "./modules/joinLeave/JoinLeaveModule.js";
import LevelsModule from "./modules/levels/LevelsModule.js";
import MiscModule from "./modules/misc/MiscModule.js";
import NHLModule from "./modules/nhl/NHLModule.js";
import PlayerEmojisModule from "./modules/playerEmojis/PlayerEmojisModule.js";
import UserManagementModule from "./modules/userManagement/UserManagementModule.js";
import VisitorRoleModule from "./modules/visitorRole/VisitorRoleModule.js";

new AdminModule().enable();
new CustomCommandsModule().enable();
new DaysUntilModule().enable();
new GameDayPostsModule().enable();
new JoinLeaveModule().enable();
new LevelsModule().enable();
new MiscModule().enable();
new NHLModule().enable();
new PlayerEmojisModule().enable();
new UserManagementModule().enable();
new VisitorRoleModule().enable();

/* -------------------------------------------------------------------------- */
/*                      Register Our Other Event Handlers                     */
/* -------------------------------------------------------------------------- */
import onMessageCreate from "./common/listeners/onMessageCreate.js";
import onInteractionCreate from "./common/listeners/onInteractionCreate.js";
import onReady from "./common/listeners/onReady.js";

onMessageCreate(client);
onInteractionCreate(client);
onReady(client);

/* -------------------------------------------------------------------------- */
/*                                Log into bot                                */
/* -------------------------------------------------------------------------- */
client.login(Config.getConfig().token);

/* -------------------------------------------------------------------------- */
/*                           Setup HTTP Health Check                          */
/* -------------------------------------------------------------------------- */
import express from "express";
import { getBotHealth } from "./common/utils/healthCheck.js";
import IBotHealth from "./common/interfaces/IBotHealth.js";

const app = express();
const port = process.env.PORT || 3000;

app.get("/health", (req, res) => {
  const health: IBotHealth = getBotHealth();
  if (health.status === "healthy") {
    res.status(200).json(health);
  } else {
    res.status(503).json(health);
  }
});

app.listen(port, () => {
  Stumper.info(`Health check server is running on port ${port}`, "healthCheck");
});
