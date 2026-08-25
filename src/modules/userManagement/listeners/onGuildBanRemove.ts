import { AuditLogEvent } from "discord.js";
import ClientManager from "@common/managers/ClientManager";
import Stumper from "stumper";
import UserManagementDB from "../db/UserManagementDB";
import { ModerationEventType } from "../db/schema";

/**
 * Records every unban as a moderation event on the user's history. The executor is looked up via the
 * audit log since the unban event itself doesn't include who performed it.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildBanRemove", async (ban) => {
    let moderatorId: string | undefined;
    try {
      const auditLogs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove, limit: 5 });
      const entry = auditLogs.entries.find((e) => e.targetId === ban.user.id);
      moderatorId = entry?.executor?.id;
    } catch (error) {
      Stumper.caughtError(error, "userManagement:onGuildBanRemove:onGuildBanRemove");
    }

    const db = new UserManagementDB();
    await db.addModerationEvent(ban.user.id, ModerationEventType.UNBAN, moderatorId);
  });
};
