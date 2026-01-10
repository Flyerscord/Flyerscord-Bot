import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import Stumper, { LOG_LEVEL, TIMEZONE } from "stumper";

import processErrorHandling from "@common/listeners/processErrorHandling";
import BotHealthManager from "@common/managers/BotHealthManager";
import discordErrorHandling from "@common/listeners/discordErrorHandling";
import discordConnectionHandling from "@common/listeners/discordConnectionHandling";
import ClientManager from "@common/managers/ClientManager";
import SlashCommandManager from "@common/managers/SlashCommandManager";
import TextCommandManager from "@common/managers/TextCommandManager";
import ContextMenuCommandManager from "@common/managers/ContextMenuManager";
import ModalMenuManager from "@common/managers/ModalMenuManager";
import ModuleManager from "@common/managers/ModuleManager";
import HealthCheckModule from "@modules/healthcheck/HealthCheckModule";
import ImageProxyModule from "@modules/imageProxy/ImageProxyModule";
import AdminModule from "@modules/admin/AdminModule";
import CustomCommandsModule from "@modules/customCommands/CustomCommandsModule";
import DaysUntilModule from "@modules/daysUntil/DaysUntilModule";
import GameDayPostsModule from "@modules/gamedayPosts/GameDayPostsModule";
import JoinLeaveModule from "@modules/joinLeave/JoinLeaveModule";
import LevelsModule from "@modules/levels/LevelsModule";
import MiscModule from "@modules/misc/MiscModule";
import NHLModule from "@modules/nhl/NHLModule";
import PinsModule from "@modules/pins/PinsModule";
import PlayerEmojisModule from "@modules/playerEmojis/PlayerEmojisModule";
import ReactionRoleModule from "@modules/reactionRole/ReactionRoleModule";
import RulesModule from "@modules/rules/RulesModule";
import StatsVoiceChannelModule from "@modules/statsVoiceChannel/StatsVoiceChannelModule";
import VisitorRoleModule from "@modules/visitorRole/VisitorRoleModule";
import RegisterCommandsModule from "@modules/registerCommands/RegisterCommandsModule";
import BlueSkyModule from "@modules/bluesky/BlueSkyModule";
import onMessageCreate from "@common/listeners/onMessageCreate";
import onInteractionCreate from "@common/listeners/onInteractionCreate";
import onReady from "@common/listeners/onReady";
import CombinedTeamInfoCache from "@common/cache/CombinedTeamInfoCache";
import ConfigManager from "@root/src/common/managers/ConfigManager";
import CommonModule from "./common/CommonModule";
import onSigInt from "@common/listeners/onSigInt";

Stumper.setConfig({ logLevel: LOG_LEVEL.ALL, useColors: false });

processErrorHandling();
onSigInt();

void startUp();

async function startUp(): Promise<void> {
  const moduleManager = ModuleManager.getInstance();

  const configManager = ConfigManager.getInstance();
  await configManager.refreshConfig();

  const commonModule = CommonModule.getInstance();
  const commonModuleResult = await moduleManager.addModule(commonModule);
  if (!commonModuleResult) {
    Stumper.error("Failed to enable Common Module", "main:startUp");
    return;
  }

  Stumper.setConfig({ logLevel: configManager.getLoadedConfigByModuleAndKey("Common", "logLevel"), timezone: TIMEZONE.LOCAL });
  Stumper.info(`Starting Bot in ${commonConfig.productionMode ? "production" : "non-production"} mode!`, "main:CheckConfig");

  BotHealthManager.getInstance();

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

  discordErrorHandling(client);
  discordConnectionHandling(client);

  client.slashCommands = new Collection();
  client.textCommands = new Collection();
  client.modals = new Collection();
  client.contextMenus = new Collection();

  ClientManager.getInstance(client);
  TextCommandManager.getInstance();
  SlashCommandManager.getInstance();
  ContextMenuCommandManager.getInstance();
  ModalMenuManager.getInstance();

  // Initialize and update the caches
  await CombinedTeamInfoCache.getInstance().forceUpdate();

  // Enable all modules before starting the bot
  // Health check must be enabled first followed by the image proxy
  await moduleManager.addModule(HealthCheckModule.getInstance(config));

  // Only enable the image proxy in production
  if (commonConfig.productionMode) {
    await moduleManager.addModule(CustomCommandsModule.getInstance(config));
    await moduleManager.addModule(ImageProxyModule.getInstance(config));
  }

  await moduleManager.addModule(AdminModule.getInstance(config));
  await moduleManager.addModule(DaysUntilModule.getInstance(config));
  await moduleManager.addModule(GameDayPostsModule.getInstance(config));
  await moduleManager.addModule(JoinLeaveModule.getInstance(config));
  await moduleManager.addModule(LevelsModule.getInstance(config));
  await moduleManager.addModule(MiscModule.getInstance(config));
  await moduleManager.addModule(NHLModule.getInstance(config));
  await moduleManager.addModule(PinsModule.getInstance(config));
  await moduleManager.addModule(PlayerEmojisModule.getInstance(config));
  await moduleManager.addModule(ReactionRoleModule.getInstance(config));
  await moduleManager.addModule(RulesModule.getInstance(config));
  await moduleManager.addModule(StatsVoiceChannelModule.getInstance(config));
  await moduleManager.addModule(VisitorRoleModule.getInstance(config));
  await moduleManager.addModule(BlueSkyModule.getInstance(config));

  // Must be enabled last
  await moduleManager.addModule(RegisterCommandsModule.getInstance(config));

  /* -------------------------------------------------------------------------- */
  /*                      Register Our Other Event Handlers                     */
  /* -------------------------------------------------------------------------- */
  onMessageCreate(client);
  onInteractionCreate(client);
  onReady(client);

  /* -------------------------------------------------------------------------- */
  /*                                Log into bot                                */
  /* -------------------------------------------------------------------------- */
  await client.login(commonConfig.token);
}
