import { GuildAuditLogs, AuditLogEvent } from "discord.js";
import { getGuild } from "./guilds";
import Stumper from "stumper";

export async function getAuditLogs<T extends AuditLogEvent>(type: T, limit: number = 100): Promise<GuildAuditLogs<T> | undefined> {
  const guild = getGuild();
  if (!guild) {
    Stumper.error("Error finding guild", "common:auditLog:getAuditLogs");
    return undefined;
  }

  return (await guild.fetchAuditLogs({
    type,
    limit,
  })) as GuildAuditLogs<T>;
}
