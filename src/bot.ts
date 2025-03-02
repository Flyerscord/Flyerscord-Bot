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
import CommonModule from "./common/CommonModule";

const config = Config.loadConfig();

CommonModule.getInstance(config);

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
/*                            Import Module Manager                           */
/* -------------------------------------------------------------------------- */
import ModuleManager from "./common/managers/ModuleManager";

/* -------------------------------------------------------------------------- */
/*                               Import Modules                               */
/* -------------------------------------------------------------------------- */
import HealthCheckModule from "./modules/healthcheck/HealthCheckModule";
import ImageProxyModule from "./modules/imageProxy/ImageProxyModule";
import AdminModule from "./modules/admin/AdminModule";
import CustomCommandsModule from "./modules/customCommands/CustomCommandsModule";
import DaysUntilModule from "./modules/daysUntil/DaysUntilModule";
import GameDayPostsModule from "./modules/gamedayPosts/GameDayPostsModule";
import JoinLeaveModule from "./modules/joinLeave/JoinLeaveModule";
import LevelsModule from "./modules/levels/LevelsModule";
import MiscModule from "./modules/misc/MiscModule";
import NHLModule from "./modules/nhl/NHLModule";
import PlayerEmojisModule from "./modules/playerEmojis/PlayerEmojisModule";
import ReactionRoleModule from "./modules/reactionRole/ReactionRoleModule";
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
  const moduleManager = ModuleManager.getInstance();
  // Initialize and update the caches
  await CombinedTeamInfoCache.getInstance().forceUpdate();

  // Enable all modules before starting the bot
  // Health check must be enabled first followed by the image proxy
  await moduleManager.addModule(new HealthCheckModule());

  // Only enable the image proxy in production
  if (Config.isProductionMode()) {
    await moduleManager.addModule(new ImageProxyModule());
  }

  await moduleManager.addModule(new AdminModule());
  await moduleManager.addModule(new CustomCommandsModule());
  await moduleManager.addModule(new DaysUntilModule());
  await moduleManager.addModule(new GameDayPostsModule());
  await moduleManager.addModule(new JoinLeaveModule());
  await moduleManager.addModule(new LevelsModule());
  await moduleManager.addModule(new MiscModule());
  await moduleManager.addModule(new NHLModule());
  await moduleManager.addModule(new PlayerEmojisModule());
  await moduleManager.addModule(new ReactionRoleModule());
  await moduleManager.addModule(new StatsVoiceChannelModule());
  await moduleManager.addModule(new UserManagementModule());
  await moduleManager.addModule(new VisitorRoleModule());
  await moduleManager.addModule(new BlueSkyModule());

  // Must be enabled last
  await moduleManager.addModule(new RegisterCommandsModule());

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
