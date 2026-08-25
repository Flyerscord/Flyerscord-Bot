import { AuditLogEvent } from "discord.js";
import ClientManager from "@common/managers/ClientManager";
import Stumper from "stumper";
import UserManagementDB from "../db/UserManagementDB";
import { ModerationEventType } from "../db/schema";

const KICK_DETECTION_WINDOW_MS = 5_000;

/**
 * Discord doesn't emit a dedicated "kick" event, so a plain member-leave is distinguished from a kick
 * by checking for a recent matching `MemberKick` audit log entry. This listener only records kicks into
 * the moderation history; leave-tracking itself is owned by the `JoinLeave` module, which has its own
 * separate `guildMemberRemove` listener.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildMemberRemove", async (member) => {
    try {
      const auditLogs = await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 5 });
      const entry = auditLogs.entries.find((e) => e.targetId === member.id && Date.now() - e.createdTimestamp <= KICK_DETECTION_WINDOW_MS);
      if (!entry) {
        return;
      }

      const db = new UserManagementDB();
      await db.addModerationEvent(member.id, ModerationEventType.KICK, entry.executor?.id, entry.reason ?? undefined);
    } catch (error) {
      Stumper.caughtError(error, "userManagement:onGuildMemberRemove:onGuildMemberRemove");
    }
  });
};
