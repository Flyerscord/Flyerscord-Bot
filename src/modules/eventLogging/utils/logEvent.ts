import { EmbedBuilder } from "discord.js";
import MyAuditLog from "@common/utils/MyAuditLog";
import EventLogQueue from "./EventLogQueue";

/**
 * Records an audit log entry for an event and enqueues its embed to be sent to the configured
 * EventLogging channel on the next queue drain. The audit log write is fire-and-forget (not
 * awaited) so it never blocks the caller, and is the durable record of the event independent of
 * whether/when the embed makes it to Discord.
 * @param action - The audit log action name to record
 * @param embed - The embed to enqueue for the log channel
 * @param userId - The Discord user ID the event relates to, if any
 * @param details - Extra structured data to store in the audit log entry
 */
export default function logEvent(action: string, embed: EmbedBuilder, userId?: string, details?: Record<string, unknown>): void {
  void MyAuditLog.createAuditLog("EventLogging", { action, userId, details });
  EventLogQueue.getInstance().enqueue(embed);
}
