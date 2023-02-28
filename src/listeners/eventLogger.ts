import {
  AutoModerationActionExecution,
  AutoModerationRule,
  Client,
  DMChannel,
  GuildBan,
  GuildEmoji,
  GuildMember,
  GuildScheduledEvent,
  GuildScheduledEventStatus,
  NonThreadGuildBasedChannel,
  PartialGuildMember,
} from "discord.js";
import Logger from "../util/Logger";

export default (client: Client): void => {
  // Channel Events
  client.on("channelCreate", async (channel: NonThreadGuildBasedChannel) => {});
  client.on("channelDelete", async (channel: DMChannel | NonThreadGuildBasedChannel) => {});
  client.on("channelUpdate", async (channel: DMChannel | NonThreadGuildBasedChannel) => {});

  // Auto Moderation Events
  client.on(
    "autoModerationActionExecution",
    async (autoModerationActionExecution: AutoModerationActionExecution) => {}
  );
  client.on("autoModerationRuleCreate", async (autoModerationRule: AutoModerationRule) => {});
  client.on("autoModerationRuleDelete", async (autoModerationRule: AutoModerationRule) => {});
  client.on(
    "autoModerationRuleUpdate",
    async (oldAutoModerationRule: AutoModerationRule | null, newAutoModerationRule: AutoModerationRule) => {}
  );

  // Emoji Events
  client.on("emojiCreate", async (emoji: GuildEmoji) => {});
  client.on("emojiDelete", async (emoji: GuildEmoji) => {});
  client.on("emojiUpdate", async (oldEmoji: GuildEmoji, newEmoji: GuildEmoji) => {});

  // Ban Events
  client.on("guildBanAdd", (ban: GuildBan) => {});
  client.on("guildBanRemove", (ban: GuildBan) => {});

  // Member Events
  client.on("guildMemberAdd", (member: GuildMember) => {});
  client.on("guildMemberRemove", (member: GuildMember | PartialGuildMember) => {});
  client.on("guildMemberUpdate", (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => {});

  // Scheduled Events Events
  client.on("guildScheduledEventCreate", (guildScheduledEvent: GuildScheduledEvent<GuildScheduledEventStatus>) => {});
  // client.on("guildScheduledEventDelete", ())
};
