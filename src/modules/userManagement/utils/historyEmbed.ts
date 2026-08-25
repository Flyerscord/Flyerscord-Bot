import { EmbedBuilder, User } from "discord.js";
import ConfigManager from "@common/managers/ConfigManager";
import { HistoryEntry } from "../db/UserManagementDB";
import { ModerationEvent, ModerationEventType, Note, Warning } from "../db/schema";

export type HistoryFilter = "All" | "Warnings" | "Notes" | "ModerationEvents";

function formatWarning(warning: Warning): string {
  let messageLink = "";
  if (warning.messageId && warning.channelId) {
    const guildId = ConfigManager.getInstance().getConfig("Common").masterGuildId;
    messageLink = `\n[Jump to Message](https://discord.com/channels/${guildId}/${warning.channelId}/${warning.messageId})`;
  }
  return `<t:${Math.floor(warning.createdAt.getTime() / 1000)}:R> by <@${warning.warnedBy}>: ${warning.reason}${messageLink}`;
}

function formatNote(note: Note): string {
  return `<t:${Math.floor(note.createdAt.getTime() / 1000)}:R> by <@${note.addedBy}>: ${note.note}`;
}

function formatModerationEvent(event: ModerationEvent): string {
  const verb = event.type === ModerationEventType.BAN ? "Banned" : event.type === ModerationEventType.UNBAN ? "Unbanned" : "Kicked";
  const moderator = event.moderatorId ? ` by <@${event.moderatorId}>` : "";
  const reason = event.reason ? `: ${event.reason}` : "";
  return `<t:${Math.floor(event.createdAt.getTime() / 1000)}:R> ${verb}${moderator}${reason}`;
}

function formatEntry(entry: HistoryEntry): string {
  switch (entry.kind) {
    case "warning":
      return formatWarning(entry.entry);
    case "note":
      return formatNote(entry.entry);
    case "moderationEvent":
      return formatModerationEvent(entry.entry);
  }
}

/**
 * Builds the embed shown by both `/userhistory` and the "View History" notification button, listing a
 * user's warnings, notes, and moderation events (bans/unbans/kicks), newest first.
 * @param user - The Discord user the history belongs to
 * @param history - The user's combined history entries (see `UserManagementDB.getHistory`)
 * @param filter - Which entry kinds to include
 * @returns The built embed
 */
export function buildHistoryEmbed(user: User, history: HistoryEntry[], filter: HistoryFilter = "All"): EmbedBuilder {
  const filtered = history.filter((entry) => {
    if (filter === "All") return true;
    if (filter === "Warnings") return entry.kind === "warning";
    if (filter === "Notes") return entry.kind === "note";
    return entry.kind === "moderationEvent";
  });

  const embed = new EmbedBuilder()
    .setTitle(`History for ${user.username}`)
    .setThumbnail(user.displayAvatarURL())
    .setColor("Random")
    .setFooter({ text: `User ID: ${user.id}` });

  if (filtered.length === 0) {
    embed.setDescription("No history found.");
    return embed;
  }

  const lines = filtered.map(formatEntry).join("\n\n");
  if (lines.length <= 4096) {
    embed.setDescription(lines);
    return embed;
  }

  embed.setDescription(lines.substring(0, 4080) + "\n\n... truncated");
  return embed;
}
