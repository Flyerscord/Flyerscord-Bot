/* -------------------------------------------------------------------------- */
/*                                Setup Stumper                                */
/* -------------------------------------------------------------------------- */
import Stumper, { LOG_LEVEL } from "stumper";
Stumper.setConfig({ logLevel: LOG_LEVEL.ALL, useColors: false });

/* -------------------------------------------------------------------------- */
/*                        Setup Process Error Handling                        */
/* -------------------------------------------------------------------------- */
import processErrorHandling from "./common/listeners/processErrorHandling";

processErrorHandling();

/* -------------------------------------------------------------------------- */
/*                            Setup SigINT handling                           */
/* -------------------------------------------------------------------------- */
import onSigInt from "./common/listeners/onSigInt";

onSigInt();

/* -------------------------------------------------------------------------- */
/*                                Check Config                                */
/* -------------------------------------------------------------------------- */
import Config from "./common/config/Config";

if (!Config.fileExists()) {
  Stumper.error("Config file not found", "main");
  process.exit(1);
}

Stumper.setConfig({ logLevel: Config.getConfig().logLevel });
Stumper.info(`Starting Bot in ${Config.isProductionMode() ? "production" : "non-production"} mode!`, "main");

/* -------------------------------------------------------------------------- */
/*                          Initialize Health Manager                         */
/* -------------------------------------------------------------------------- */
import BotHealthManager from "./common/managers/BotHealthManager";
BotHealthManager.getInstance();

/* -------------------------------------------------------------------------- */
/*                            Create Discord Client                           */
/* -------------------------------------------------------------------------- */
import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
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
/*                               Import Modules                               */
/* -------------------------------------------------------------------------- */
import AdminModule from "./modules/admin/AdminModule";
import CustomCommandsModule from "./modules/customCommands/CustomCommandsModule";
import DaysUntilModule from "./modules/daysUntil/DaysUntilModule";
import GameDayPostsModule from "./modules/gamedayPosts/GameDayPostsModule";
import HealthCheckModule from "./modules/healthcheck/HealthCheckModule";
import JoinLeaveModule from "./modules/joinLeave/JoinLeaveModule";
import LevelsModule from "./modules/levels/LevelsModule";
import MiscModule from "./modules/misc/MiscModule";
import NHLModule from "./modules/nhl/NHLModule";
import PlayerEmojisModule from "./modules/playerEmojis/PlayerEmojisModule";
import UserManagementModule from "./modules/userManagement/UserManagementModule";
import VisitorRoleModule from "./modules/visitorRole/VisitorRoleModule";

/* -------------------------------------------------------------------------- */
/*                       Import Our Other Event Handlers                      */
/* -------------------------------------------------------------------------- */
import onMessageCreate from "./common/listeners/onMessageCreate";
import onInteractionCreate from "./common/listeners/onInteractionCreate";
import onReady from "./common/listeners/onReady";

/* -------------------------------------------------------------------------- */
/*                                 Run Startup                                */
/* -------------------------------------------------------------------------- */
startUp();

async function startUp(): Promise<void> {
  // Enable all modules before starting the bot
  await new AdminModule().enable();
  await new CustomCommandsModule().enable();
  await new DaysUntilModule().enable();
  await new GameDayPostsModule().enable();
  await new HealthCheckModule().enable();
  await new JoinLeaveModule().enable();
  await new LevelsModule().enable();
  await new MiscModule().enable();
  await new NHLModule().enable();
  await new PlayerEmojisModule().enable();
  await new UserManagementModule().enable();
  await new VisitorRoleModule().enable();

  /* -------------------------------------------------------------------------- */
  /*                      Register Our Other Event Handlers                     */
  /* -------------------------------------------------------------------------- */
  onMessageCreate(client);
  onInteractionCreate(client);
  onReady(client);

  /* -------------------------------------------------------------------------- */
  /*                                Log into bot                                */
  /* -------------------------------------------------------------------------- */
  client.login(Config.getConfig().token);
}
