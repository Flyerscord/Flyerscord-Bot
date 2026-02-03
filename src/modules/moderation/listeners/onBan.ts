import ClientManager from "@common/managers/ClientManager";
import { AuditLogEvent, GuildBan } from "discord.js";
import ModerationDB from "../db/ModerationDB";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";
import { AuditLogSeverity } from "@common/db/schema";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildBanAdd", async (ban: GuildBan) => {
    const db = new ModerationDB();

    const auditLog = await discord.auditLog.getAuditLogs(AuditLogEvent.MemberBanAdd, 1);
    if (auditLog && auditLog.entries.size > 0) {
      const entry = auditLog.entries.first();
      if (entry?.target?.id === ban.user.id) {
        if (!entry.executor) {
          Stumper.error("Audit log entry missing executor", "moderation:onBan");
          return;
        }
        void db.createAuditLog({
          userId: entry.executor.id,
          action: "Ban",
          severity: AuditLogSeverity.CRITICAL,
          details: {
            targetUser: ban.user.id,
            reason: entry.reason ?? "",
          },
        });
        await db.addBan(ban.user.id, entry.reason ?? "", entry.executor?.id);
      }
    }
  });
};
