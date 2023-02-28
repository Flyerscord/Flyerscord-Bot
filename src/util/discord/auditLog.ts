import { AuditLogEvent, Guild } from "discord.js";

export async function getMostRecentEvent(guild: Guild, type: AuditLogEventType): Promise<AuditLogEvent> {
  const logs = await guild.fetchAuditLogs();
  return logs.entries.find((entry) => {
    if (entry.actionType == type) {
    }
  });
}
