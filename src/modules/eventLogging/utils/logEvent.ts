import { EmbedBuilder } from "discord.js";
import ConfigManager from "@common/managers/ConfigManager";
import discord from "@common/utils/discord/discord";
import MyAuditLog from "@common/utils/MyAuditLog";
import Stumper from "stumper";

/**
 * Sends an event log embed to the configured EventLogging channel and records an audit log entry.
 * Errors sending the embed are caught and reported via Stumper so a single failed listener never crashes the bot.
 * @param source - The Stumper log tag identifying the calling listener
 * @param action - The audit log action name to record
 * @param embed - The embed to send to the log channel
 * @param userId - The Discord user ID the event relates to, if any
 * @param details - Extra structured data to store in the audit log entry
 */
export default async function logEvent(
  source: string,
  action: string,
  embed: EmbedBuilder,
  userId?: string,
  details?: Record<string, unknown>,
): Promise<void> {
  try {
    const logChannelId = ConfigManager.getInstance().getConfig("EventLogging").logChannelId;
    await discord.messages.sendEmbedToChannel(logChannelId, embed);
  } catch (error) {
    Stumper.caughtError(error, source);
  } finally {
    void MyAuditLog.createAuditLog("EventLogging", { action, userId, details });
  }
}
