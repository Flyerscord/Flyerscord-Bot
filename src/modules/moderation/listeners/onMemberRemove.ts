import ClientManager from "@common/managers/ClientManager";
import { AuditLogEvent, GuildMember, PartialGuildMember } from "discord.js";
import ModerationDB from "../db/ModerationDB";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";
import { AuditLogSeverity } from "@common/db/schema";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildMemberRemove", async (member: GuildMember | PartialGuildMember) => {
    await onKick(member);
  });
};

async function onKick(member: GuildMember | PartialGuildMember): Promise<void> {
  const db = new ModerationDB();

  const auditLog = await discord.auditLog.getAuditLogs(AuditLogEvent.MemberKick, 1);
  if (auditLog && auditLog.entries.size > 0) {
    const entry = auditLog.entries.first();
    if (entry?.target?.id === member.user.id) {
      if (!entry.executor) {
        Stumper.error("Audit log entry missing executor", "moderation:onBan");
        return;
      }
      void db.createAuditLog({
        userId: entry.executor.id,
        action: "Kick",
        severity: AuditLogSeverity.WARNING,
        details: {
          targetUser: member.user.id,
          reason: entry.reason ?? "",
        },
      });
      await db.addKick(member.user.id, entry.reason ?? "", entry.executor?.id);
    }
  }
}
