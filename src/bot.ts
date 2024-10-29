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
import Config from "./common/config/Config";

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
import discordErrorHandling from "./common/listeners/discordErrorHandling";

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
import ClientManager from "./common/managers/ClientManager";
import SlashCommandManager from "./common/managers/SlashCommandManager";
import TextCommandManager from "./common/managers/TextCommandManager";
import ContextMenuCommandManager from "./common/managers/ContextMenuManager";
import ModalMenuManager from "./common/managers/ModalMenuManager";

ClientManager.getInstance(client);
TextCommandManager.getInstance();
SlashCommandManager.getInstance();
ContextMenuCommandManager.getInstance();
ModalMenuManager.getInstance();

/* -------------------------------------------------------------------------- */
/*                              Register Modules                              */
/* -------------------------------------------------------------------------- */
import AdminModule from "./modules/admin/AdminModule";
import CustomCommandsModule from "./modules/customCommands/CustomCommandsModule";
import DaysUntilModule from "./modules/daysUntil/DaysUntilModule";
import GameDayPostsModule from "./modules/gamedayPosts/GameDayPostsModule";
import JoinLeaveModule from "./modules/joinLeave/JoinLeaveModule";
import LevelsModule from "./modules/levels/LevelsModule";
import MiscModule from "./modules/misc/MiscModule";
import NHLModule from "./modules/nhl/NHLModule";
import PlayerEmojisModule from "./modules/playerEmojis/PlayerEmojisModule";
import UserManagementModule from "./modules/userManagement/UserManagementModule";
import VisitorRoleModule from "./modules/visitorRole/VisitorRoleModule";

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
import onMessageCreate from "./common/listeners/onMessageCreate";
import onInteractionCreate from "./common/listeners/onInteractionCreate";
import onReady from "./common/listeners/onReady";

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
import { getBotHealth } from "./common/utils/healthCheck";
import IBotHealth from "./common/interfaces/IBotHealth";

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
