import Module, { IModuleConfigSchema } from "@common/models/Module";
import Zod from "@common/utils/ZodWrapper";
import onMessageUpdate from "./listeners/onMessageUpdate";
import onMessageDelete from "./listeners/onMessageDelete";
import onMessageDeleteBulk from "./listeners/onMessageDeleteBulk";
import onMessageReactionAdd from "./listeners/onMessageReactionAdd";
import onMessageReactionRemove from "./listeners/onMessageReactionRemove";
import onGuildMemberAdd from "./listeners/onGuildMemberAdd";
import onGuildMemberRemove from "./listeners/onGuildMemberRemove";
import onGuildBanAdd from "./listeners/onGuildBanAdd";
import onGuildBanRemove from "./listeners/onGuildBanRemove";
import onGuildMemberUpdate from "./listeners/onGuildMemberUpdate";
import onChannelCreate from "./listeners/onChannelCreate";
import onChannelUpdate from "./listeners/onChannelUpdate";
import onChannelDelete from "./listeners/onChannelDelete";
import onRoleCreate from "./listeners/onRoleCreate";
import onRoleUpdate from "./listeners/onRoleUpdate";
import onRoleDelete from "./listeners/onRoleDelete";
import onEmojiCreate from "./listeners/onEmojiCreate";
import onEmojiUpdate from "./listeners/onEmojiUpdate";
import onEmojiDelete from "./listeners/onEmojiDelete";
import onStickerCreate from "./listeners/onStickerCreate";
import onStickerUpdate from "./listeners/onStickerUpdate";
import onStickerDelete from "./listeners/onStickerDelete";
import onInviteCreate from "./listeners/onInviteCreate";
import onInviteDelete from "./listeners/onInviteDelete";
import onGuildUpdate from "./listeners/onGuildUpdate";
import onWebhooksUpdate from "./listeners/onWebhooksUpdate";
import onGuildScheduledEventCreate from "./listeners/onGuildScheduledEventCreate";
import onGuildScheduledEventUpdate from "./listeners/onGuildScheduledEventUpdate";
import onGuildScheduledEventDelete from "./listeners/onGuildScheduledEventDelete";
import onThreadCreate from "./listeners/onThreadCreate";
import onThreadUpdate from "./listeners/onThreadUpdate";
import onThreadDelete from "./listeners/onThreadDelete";
import onVoiceStateUpdate from "./listeners/onVoiceStateUpdate";
import onAutoModerationActionExecution from "./listeners/onAutoModerationActionExecution";
import ConfigManager from "@common/managers/ConfigManager";
import EventLogQueue from "./utils/EventLogQueue";

export const eventLoggingConfigSchema = [
  {
    key: "logChannelId",
    description: "The channel ID to send all event log messages to",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "logReactionEvents",
    description: "Whether to log reaction add/remove events (noisy, off by default)",
    required: false,
    secret: false,
    requiresRestart: false,
    defaultValue: false,
    schema: Zod.boolean(),
  },
  {
    key: "queueDrainIntervalSeconds",
    description: "How often, in seconds, to batch-send queued event log embeds to the log channel",
    required: false,
    secret: false,
    requiresRestart: true,
    defaultValue: 3,
    schema: Zod.number({ min: 1, max: 60 }),
  },
] as const satisfies readonly IModuleConfigSchema[];

export default class EventLoggingModule extends Module {
  protected readonly CONFIG_SCHEMA = eventLoggingConfigSchema;

  constructor() {
    super("EventLogging");
  }

  protected async setup(): Promise<void> {
    this.registerListeners();
    const drainIntervalSeconds = ConfigManager.getInstance().getConfig("EventLogging").queueDrainIntervalSeconds;
    EventLogQueue.getInstance().start(drainIntervalSeconds);
  }

  protected async cleanup(): Promise<void> {
    EventLogQueue.getInstance().stop();
  }

  private registerListeners(): void {
    onMessageUpdate();
    onMessageDelete();
    onMessageDeleteBulk();
    onMessageReactionAdd();
    onMessageReactionRemove();
    onGuildMemberAdd();
    onGuildMemberRemove();
    onGuildBanAdd();
    onGuildBanRemove();
    onGuildMemberUpdate();
    onChannelCreate();
    onChannelUpdate();
    onChannelDelete();
    onRoleCreate();
    onRoleUpdate();
    onRoleDelete();
    onEmojiCreate();
    onEmojiUpdate();
    onEmojiDelete();
    onStickerCreate();
    onStickerUpdate();
    onStickerDelete();
    onInviteCreate();
    onInviteDelete();
    onGuildUpdate();
    onWebhooksUpdate();
    onGuildScheduledEventCreate();
    onGuildScheduledEventUpdate();
    onGuildScheduledEventDelete();
    onThreadCreate();
    onThreadUpdate();
    onThreadDelete();
    onVoiceStateUpdate();
    onAutoModerationActionExecution();
  }
}
