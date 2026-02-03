import ClientManager from "@common/managers/ClientManager";
import { AuditLogEvent, GuildMember, PartialGuildMember } from "discord.js";
import ModerationDB from "../db/ModerationDB";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";
import { AuditLogSeverity } from "@common/db/schema";
import Time from "@common/utils/Time";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildMemberUpdate", async (oldMember, newMember) => {
    await onTimeout(oldMember, newMember);
  });
};

async function onTimeout(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember | PartialGuildMember): Promise<void> {
  const db = new ModerationDB();

  if (oldMember.communicationDisabledUntil !== newMember.communicationDisabledUntil) {
    if (newMember.communicationDisabledUntil) {
      // User just got timed out

      const auditLog = await discord.auditLog.getAuditLogs(AuditLogEvent.MemberUpdate, 1);
      if (auditLog && auditLog.entries.size > 0) {
        const entry = auditLog.entries.first();
        if (entry?.target?.id === newMember.user.id) {
          if (!entry.executor) {
            Stumper.error("Audit log entry missing executor", "moderation:onTimeout");
            return;
          }
          void db.createAuditLog({
            userId: entry.executor.id,
            action: "TimeoutStart",
            severity: AuditLogSeverity.WARNING,
            details: {
              bannedUser: newMember.user.id,
              reason: entry.reason ?? "",
              until: newMember.communicationDisabledUntil,
            },
          });
          await db.addMute(newMember.user.id, entry.reason ?? "", entry.executor?.id, Time.timeUntil(newMember.communicationDisabledUntil) / 1000);
        }
      }
    }
  }
}
