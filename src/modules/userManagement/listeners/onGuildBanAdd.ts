import { AuditLogEvent } from "discord.js";
import ClientManager from "@common/managers/ClientManager";
import Stumper from "stumper";
import UserManagementDB from "../db/UserManagementDB";
import { ModerationEventType } from "../db/schema";

/**
 * Records every ban as a moderation event on the banned user's history, regardless of whether it came
 * from this bot or Discord's native ban UI. The executor is looked up via the audit log since the ban
 * event itself doesn't include who performed it.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildBanAdd", async (ban) => {
    let moderatorId: string | undefined;
    try {
      const auditLogs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 5 });
      const entry = auditLogs.entries.find((e) => e.targetId === ban.user.id);
      moderatorId = entry?.executor?.id;
    } catch (error) {
      Stumper.caughtError(error, "userManagement:onGuildBanAdd:onGuildBanAdd");
    }

    const db = new UserManagementDB();
    await db.addModerationEvent(ban.user.id, ModerationEventType.BAN, moderatorId, ban.reason ?? undefined);
  });
};
