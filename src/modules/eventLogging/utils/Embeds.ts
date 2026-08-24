import {
  AnyThreadChannel,
  AutoModerationActionExecution,
  Colors,
  DMChannel,
  EmbedBuilder,
  Guild,
  GuildBan,
  GuildChannel,
  GuildEmoji,
  GuildMember,
  GuildScheduledEvent,
  Invite,
  Message,
  MessageReaction,
  NewsChannel,
  NonThreadGuildBasedChannel,
  PartialGuildMember,
  PartialGuildScheduledEvent,
  PartialMessage,
  PartialMessageReaction,
  PartialUser,
  Role,
  Sticker,
  User,
  VoiceState,
  ForumChannel,
  MediaChannel,
  TextChannel,
  VoiceChannel,
} from "discord.js";

/**
 * The color used for each category of event embed.
 */
export const EVENT_COLORS = {
  create: Colors.Green,
  update: Colors.Yellow,
  delete: Colors.Red,
  info: Colors.Grey,
} as const;

/**
 * Builds the shared embed shell (color + timestamp) used by every event log embed.
 * @param color - The color to apply to the embed
 * @param title - The embed title
 * @returns A partially built EmbedBuilder ready for a description/fields to be added
 */
function baseEmbed(color: number, title: string): EmbedBuilder {
  return new EmbedBuilder().setColor(color).setTitle(title).setTimestamp();
}

/**
 * Builds the embed for a message edit event.
 * @param oldMessage - The message before the edit, possibly partial if not cached
 * @param newMessage - The message after the edit
 * @returns The built embed
 */
export function getMessageUpdateEmbed(oldMessage: Message | PartialMessage, newMessage: Message): EmbedBuilder {
  const oldContent =
    oldMessage.partial || oldMessage.content == null ? "*content unavailable (message was not cached)*" : oldMessage.content || "*empty*";
  return baseEmbed(EVENT_COLORS.update, "Message Edited")
    .setAuthor({ name: newMessage.author?.username ?? "Unknown User", iconURL: newMessage.author?.displayAvatarURL() })
    .addFields(
      { name: "Channel", value: `${newMessage.channel}`, inline: true },
      { name: "Before", value: oldContent.substring(0, 1024) },
      { name: "After", value: (newMessage.content || "*empty*").substring(0, 1024) },
    )
    .setFooter({ text: `Message ID: ${newMessage.id}` });
}

/**
 * Builds the embed for a message delete event.
 * @param message - The deleted message, possibly partial if not cached
 * @returns The built embed
 */
export function getMessageDeleteEmbed(message: Message | PartialMessage): EmbedBuilder {
  const content = message.partial || message.content == null ? "*content unavailable (message was not cached)*" : message.content || "*empty*";
  return baseEmbed(EVENT_COLORS.delete, "Message Deleted")
    .setAuthor({ name: message.author?.username ?? "Unknown User", iconURL: message.author?.displayAvatarURL() })
    .addFields({ name: "Channel", value: `${message.channel}`, inline: true }, { name: "Content", value: content.substring(0, 1024) })
    .setFooter({ text: `Message ID: ${message.id}` });
}

/**
 * Builds the embed for a bulk message delete event.
 * @param count - The number of messages deleted
 * @param channel - The channel the messages were deleted from
 * @returns The built embed
 */
export function getMessageDeleteBulkEmbed(count: number, channel: { toString(): string }): EmbedBuilder {
  return baseEmbed(EVENT_COLORS.delete, "Messages Bulk Deleted").addFields(
    { name: "Channel", value: `${channel}`, inline: true },
    { name: "Count", value: `${count}`, inline: true },
  );
}

/**
 * Builds the embed for a reaction add or remove event.
 * @param added - Whether the reaction was added (true) or removed (false)
 * @param reaction - The reaction that was added/removed
 * @param user - The user who added/removed the reaction
 * @returns The built embed
 */
export function getReactionEmbed(added: boolean, reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser): EmbedBuilder {
  return baseEmbed(added ? EVENT_COLORS.create : EVENT_COLORS.delete, added ? "Reaction Added" : "Reaction Removed")
    .setAuthor({ name: user.username ?? "Unknown User", iconURL: user.displayAvatarURL?.() })
    .addFields(
      { name: "Emoji", value: `${reaction.emoji}`, inline: true },
      { name: "Channel", value: `${reaction.message.channel}`, inline: true },
      { name: "Message", value: `[Jump to Message](${reaction.message.url})` },
    );
}

/**
 * Builds the embed for a member join event.
 * @param member - The member who joined
 * @returns The built embed
 */
export function getMemberAddEmbed(member: GuildMember): EmbedBuilder {
  return baseEmbed(EVENT_COLORS.create, "Member Joined")
    .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() })
    .addFields({ name: "Account Created", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` })
    .setFooter({ text: `User ID: ${member.id}` });
}

/**
 * Builds the embed for a member leave event.
 * @param member - The member who left, possibly partial
 * @returns The built embed
 */
export function getMemberRemoveEmbed(member: GuildMember | PartialGuildMember): EmbedBuilder {
  return baseEmbed(EVENT_COLORS.delete, "Member Left")
    .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() })
    .setFooter({ text: `User ID: ${member.id}` });
}

/**
 * Builds the embed for a ban add or remove event.
 * @param added - Whether the ban was added (true) or removed/unbanned (false)
 * @param ban - The ban that was added/removed
 * @returns The built embed
 */
export function getBanEmbed(added: boolean, ban: GuildBan): EmbedBuilder {
  const embed = baseEmbed(added ? EVENT_COLORS.delete : EVENT_COLORS.create, added ? "Member Banned" : "Member Unbanned")
    .setAuthor({ name: ban.user.username, iconURL: ban.user.displayAvatarURL() })
    .setFooter({ text: `User ID: ${ban.user.id}` });
  if (added && ban.reason) {
    embed.addFields({ name: "Reason", value: ban.reason });
  }
  return embed;
}

/**
 * Builds the embed for a member nickname change event.
 * @param member - The member whose nickname changed
 * @param oldNickname - The previous nickname, or null if none
 * @param newNickname - The new nickname, or null if removed
 * @returns The built embed
 */
export function getNicknameChangeEmbed(member: GuildMember, oldNickname: string | null, newNickname: string | null): EmbedBuilder {
  return baseEmbed(EVENT_COLORS.update, "Nickname Changed")
    .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() })
    .addFields({ name: "Before", value: oldNickname ?? "*none*", inline: true }, { name: "After", value: newNickname ?? "*none*", inline: true });
}

/**
 * Builds the embed for a member role change event.
 * @param member - The member whose roles changed
 * @param added - The roles that were added
 * @param removed - The roles that were removed
 * @returns The built embed
 */
export function getRoleChangeEmbed(member: GuildMember, added: Role[], removed: Role[]): EmbedBuilder {
  const embed = baseEmbed(EVENT_COLORS.update, "Member Roles Updated").setAuthor({
    name: member.user.username,
    iconURL: member.user.displayAvatarURL(),
  });
  if (added.length > 0) {
    embed.addFields({ name: "Added", value: added.map((role) => `${role}`).join(", ") });
  }
  if (removed.length > 0) {
    embed.addFields({ name: "Removed", value: removed.map((role) => `${role}`).join(", ") });
  }
  return embed;
}

/**
 * Builds the embed for a member timeout applied or removed event.
 * @param member - The member who was timed out/had their timeout removed
 * @param applied - Whether the timeout was applied (true) or removed (false)
 * @param until - The timestamp the timeout expires at, if applied
 * @returns The built embed
 */
export function getTimeoutEmbed(member: GuildMember, applied: boolean, until: number | null): EmbedBuilder {
  const embed = baseEmbed(applied ? EVENT_COLORS.delete : EVENT_COLORS.create, applied ? "Member Timed Out" : "Member Timeout Removed").setAuthor({
    name: member.user.username,
    iconURL: member.user.displayAvatarURL(),
  });
  if (applied && until) {
    embed.addFields({ name: "Until", value: `<t:${Math.floor(until / 1000)}:R>` });
  }
  return embed;
}

/**
 * Builds the embed for a member boost start or stop event.
 * @param member - The member who started/stopped boosting
 * @param started - Whether boosting started (true) or stopped (false)
 * @returns The built embed
 */
export function getBoostEmbed(member: GuildMember, started: boolean): EmbedBuilder {
  return baseEmbed(started ? EVENT_COLORS.create : EVENT_COLORS.info, started ? "Member Started Boosting" : "Member Stopped Boosting").setAuthor({
    name: member.user.username,
    iconURL: member.user.displayAvatarURL(),
  });
}

/**
 * Builds the embed for a channel create/update/delete event.
 * @param action - Which action occurred
 * @param channel - The channel involved
 * @returns The built embed
 */
export function getChannelEmbed(
  action: "created" | "updated" | "deleted",
  channel: NonThreadGuildBasedChannel | DMChannel | GuildChannel,
): EmbedBuilder {
  const color = action === "created" ? EVENT_COLORS.create : action === "deleted" ? EVENT_COLORS.delete : EVENT_COLORS.update;
  const name = "name" in channel ? channel.name : channel.id;
  return baseEmbed(color, `Channel ${action[0].toUpperCase()}${action.substring(1)}`)
    .addFields({ name: "Name", value: name, inline: true })
    .setFooter({ text: `Channel ID: ${channel.id}` });
}

/**
 * Builds the embed for a role create/update/delete event.
 * @param action - Which action occurred
 * @param role - The role involved
 * @returns The built embed
 */
export function getRoleEmbed(action: "created" | "updated" | "deleted", role: Role): EmbedBuilder {
  const color = action === "created" ? EVENT_COLORS.create : action === "deleted" ? EVENT_COLORS.delete : EVENT_COLORS.update;
  return baseEmbed(color, `Role ${action[0].toUpperCase()}${action.substring(1)}`)
    .addFields({ name: "Role", value: action === "deleted" ? role.name : `${role}`, inline: true })
    .setFooter({ text: `Role ID: ${role.id}` });
}

/**
 * Builds the embed for an emoji create/update/delete event.
 * @param action - Which action occurred
 * @param emoji - The emoji involved
 * @returns The built embed
 */
export function getEmojiEmbed(action: "created" | "updated" | "deleted", emoji: GuildEmoji): EmbedBuilder {
  const color = action === "created" ? EVENT_COLORS.create : action === "deleted" ? EVENT_COLORS.delete : EVENT_COLORS.update;
  const embed = baseEmbed(color, `Emoji ${action[0].toUpperCase()}${action.substring(1)}`).addFields({
    name: "Name",
    value: emoji.name ?? "*unknown*",
    inline: true,
  });
  if (emoji.url) {
    embed.setThumbnail(emoji.url);
  }
  return embed;
}

/**
 * Builds the embed for a sticker create/update/delete event.
 * @param action - Which action occurred
 * @param sticker - The sticker involved
 * @returns The built embed
 */
export function getStickerEmbed(action: "created" | "updated" | "deleted", sticker: Sticker): EmbedBuilder {
  const color = action === "created" ? EVENT_COLORS.create : action === "deleted" ? EVENT_COLORS.delete : EVENT_COLORS.update;
  return baseEmbed(color, `Sticker ${action[0].toUpperCase()}${action.substring(1)}`).addFields({ name: "Name", value: sticker.name, inline: true });
}

/**
 * Builds the embed for an invite create/delete event.
 * @param created - Whether the invite was created (true) or deleted (false)
 * @param invite - The invite involved
 * @returns The built embed
 */
export function getInviteEmbed(created: boolean, invite: Invite): EmbedBuilder {
  const embed = baseEmbed(created ? EVENT_COLORS.create : EVENT_COLORS.delete, created ? "Invite Created" : "Invite Deleted").addFields(
    { name: "Code", value: invite.code, inline: true },
    { name: "Channel", value: `${invite.channel}`, inline: true },
  );
  if (created && invite.inviter) {
    embed.setAuthor({ name: invite.inviter.username, iconURL: invite.inviter.displayAvatarURL() });
  }
  return embed;
}

/**
 * Builds the embed for a guild settings update event.
 * @param oldGuild - The guild before the update
 * @param newGuild - The guild after the update
 * @returns The built embed
 */
export function getGuildUpdateEmbed(oldGuild: Guild, newGuild: Guild): EmbedBuilder {
  const embed = baseEmbed(EVENT_COLORS.update, "Server Updated");
  if (oldGuild.name !== newGuild.name) {
    embed.addFields({ name: "Name", value: `${oldGuild.name} → ${newGuild.name}` });
  }
  if (oldGuild.icon !== newGuild.icon) {
    embed.addFields({ name: "Icon", value: "Server icon was changed" });
  }
  return embed;
}

/**
 * Builds the embed for a webhook update event.
 * @param channel - The channel whose webhooks changed
 * @returns The built embed
 */
export function getWebhooksUpdateEmbed(channel: TextChannel | NewsChannel | VoiceChannel | ForumChannel | MediaChannel): EmbedBuilder {
  return baseEmbed(EVENT_COLORS.update, "Webhooks Updated").addFields({ name: "Channel", value: `${channel}`, inline: true });
}

/**
 * Builds the embed for a scheduled event create/update/delete event.
 * @param action - Which action occurred
 * @param event - The scheduled event involved
 * @returns The built embed
 */
export function getScheduledEventEmbed(
  action: "created" | "updated" | "deleted",
  event: GuildScheduledEvent | PartialGuildScheduledEvent,
): EmbedBuilder {
  const color = action === "created" ? EVENT_COLORS.create : action === "deleted" ? EVENT_COLORS.delete : EVENT_COLORS.update;
  return baseEmbed(color, `Scheduled Event ${action[0].toUpperCase()}${action.substring(1)}`).addFields({
    name: "Name",
    value: event.name ?? "*unknown*",
    inline: true,
  });
}

/**
 * Builds the embed for a thread create/delete event.
 * @param action - Which action occurred
 * @param thread - The thread involved
 * @returns The built embed
 */
export function getThreadEmbed(action: "created" | "deleted", thread: AnyThreadChannel): EmbedBuilder {
  return baseEmbed(
    action === "created" ? EVENT_COLORS.create : EVENT_COLORS.delete,
    `Thread ${action[0].toUpperCase()}${action.substring(1)}`,
  ).addFields({
    name: "Name",
    value: thread.name,
    inline: true,
  });
}

/**
 * Builds the embed for a thread archive/unarchive event.
 * @param thread - The thread involved
 * @param archived - Whether the thread was archived (true) or unarchived (false)
 * @returns The built embed
 */
export function getThreadArchiveEmbed(thread: AnyThreadChannel, archived: boolean): EmbedBuilder {
  return baseEmbed(archived ? EVENT_COLORS.info : EVENT_COLORS.update, archived ? "Thread Archived" : "Thread Unarchived").addFields({
    name: "Name",
    value: thread.name,
    inline: true,
  });
}

/**
 * Builds the embed for a generic thread metadata update event.
 * @param oldThread - The thread before the update
 * @param newThread - The thread after the update
 * @returns The built embed
 */
export function getThreadUpdateEmbed(oldThread: AnyThreadChannel, newThread: AnyThreadChannel): EmbedBuilder {
  const embed = baseEmbed(EVENT_COLORS.update, "Thread Updated");
  if (oldThread.name !== newThread.name) {
    embed.addFields({ name: "Name", value: `${oldThread.name} → ${newThread.name}` });
  } else {
    embed.addFields({ name: "Thread", value: `${newThread}` });
  }
  return embed;
}

/**
 * Builds the embed for a voice state change (join/leave/move/mute/deafen/stream).
 * @param title - The embed title describing which voice event occurred
 * @param member - The member whose voice state changed
 * @param description - A short description of the change
 * @returns The built embed
 */
export function getVoiceStateEmbed(title: string, state: VoiceState, description: string): EmbedBuilder {
  const embed = baseEmbed(EVENT_COLORS.info, title).setDescription(description);
  const member = state.member;
  if (member) {
    embed.setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() });
  }
  return embed;
}

/**
 * Builds the embed for an AutoMod rule trigger event.
 * @param execution - The AutoMod action execution details
 * @returns The built embed
 */
export function getAutoModerationEmbed(execution: AutoModerationActionExecution): EmbedBuilder {
  const embed = baseEmbed(EVENT_COLORS.delete, "AutoMod Rule Triggered").addFields(
    { name: "Rule", value: execution.autoModerationRule?.name ?? execution.ruleId, inline: true },
    { name: "User", value: `<@${execution.userId}>`, inline: true },
  );
  if (execution.matchedKeyword) {
    embed.addFields({ name: "Matched Keyword", value: execution.matchedKeyword, inline: true });
  }
  if (execution.content) {
    embed.addFields({ name: "Content", value: execution.content.substring(0, 1024) });
  }
  return embed;
}
