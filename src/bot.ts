/* -------------------------------------------------------------------------- */
/*                                Setup Stumper                                */
/* -------------------------------------------------------------------------- */
import Stumper, { LOG_LEVEL, TIMEZONE } from "stumper";
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
  Stumper.error("Config file not found", "main:CheckConfig");
  process.exit(1);
}

Stumper.setConfig({ logLevel: Config.getConfig().logLevel, timezone: TIMEZONE.LOCAL });
Stumper.info(`Starting Bot in ${Config.isProductionMode() ? "production" : "non-production"} mode!`, "main:CheckConfig");

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
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.User, Partials.Channel],
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
import HealthCheckModule from "./modules/healthcheck/HealthCheckModule";
import ImageProxyModule from "./modules/imageProxy/ImageProxyModule";
import AdminModule from "./modules/admin/AdminModule";
import BagReactionRoleModule from "./modules/bagReactionRole/BagReactionRoleModule";
import CustomCommandsModule from "./modules/customCommands/CustomCommandsModule";
import DaysUntilModule from "./modules/daysUntil/DaysUntilModule";
import GameDayPostsModule from "./modules/gamedayPosts/GameDayPostsModule";
import JoinLeaveModule from "./modules/joinLeave/JoinLeaveModule";
import LevelsModule from "./modules/levels/LevelsModule";
import MiscModule from "./modules/misc/MiscModule";
import NHLModule from "./modules/nhl/NHLModule";
import PlayerEmojisModule from "./modules/playerEmojis/PlayerEmojisModule";
import StatsVoiceChannelModule from "./modules/statsVoiceChannel/StatsVoiceChannelModule";
import UserManagementModule from "./modules/userManagement/UserManagementModule";
import VisitorRoleModule from "./modules/visitorRole/VisitorRoleModule";
import RegisterCommandsModule from "./modules/registerCommands/RegisterCommandsModule";
import BlueSkyModule from "./modules/bluesky/BlueSkyModule";

/* -------------------------------------------------------------------------- */
/*                       Import Our Other Event Handlers                      */
/* -------------------------------------------------------------------------- */
import onMessageCreate from "./common/listeners/onMessageCreate";
import onInteractionCreate from "./common/listeners/onInteractionCreate";
import onReady from "./common/listeners/onReady";

/* -------------------------------------------------------------------------- */
/*                                Import Caches                               */
/* -------------------------------------------------------------------------- */
import CombinedTeamInfoCache from "./common/cache/CombinedTeamInfoCache";

/* -------------------------------------------------------------------------- */
/*                                 Run Startup                                */
/* -------------------------------------------------------------------------- */
startUp();

async function startUp(): Promise<void> {
  // Initialize and update the caches
  await CombinedTeamInfoCache.getInstance().forceUpdate();

  // Enable all modules before starting the bot
  // Health check must be enabled first followed by the image proxy
  await new HealthCheckModule().enable();

  // Only enable the image proxy in production
  if (Config.isProductionMode()) {
    await new ImageProxyModule().enable();
  }

  await new AdminModule().enable();
  await new BagReactionRoleModule().enable();
  await new CustomCommandsModule().enable();
  await new DaysUntilModule().enable();
  await new GameDayPostsModule().enable();
  await new JoinLeaveModule().enable();
  await new LevelsModule().enable();
  await new MiscModule().enable();
  await new NHLModule().enable();
  await new PlayerEmojisModule().enable();
  await new StatsVoiceChannelModule().enable();
  await new UserManagementModule().enable();
  await new VisitorRoleModule().enable();
  await new BlueSkyModule().enable();

  // Must be enabled last
  await new RegisterCommandsModule().enable();

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
