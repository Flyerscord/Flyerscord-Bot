import { AuditLogEvent, PartialUser, User } from "discord.js";
import ClientManager from "@common/managers/ClientManager";
import { getMemberRemoveEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";
import Stumper from "stumper";

// How recent a MemberKick audit log entry must be to be considered a match for this leave event
const KICK_MATCH_WINDOW_MS = 5000;

/**
 * Registers the guildMemberRemove listener that logs member leaves, distinguishing a kick from a
 * voluntary leave by checking for a matching recent MEMBER_KICK audit log entry (both fire the
 * same guildMemberRemove event, so the audit log is the only way to tell them apart).
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildMemberRemove", async (member) => {
    let kick: { executor: User | PartialUser | null; reason: string | null } | undefined;

    try {
      const auditLogs = await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 5 });
      const kickEntry = auditLogs.entries.find(
        (entry) => entry.target?.id === member.id && Date.now() - entry.createdTimestamp <= KICK_MATCH_WINDOW_MS,
      );
      if (kickEntry) {
        kick = { executor: kickEntry.executor, reason: kickEntry.reason };
      }
    } catch (error) {
      Stumper.caughtError(error, "eventLogging:onGuildMemberRemove:onGuildMemberRemove");
    }

    const embed = getMemberRemoveEmbed(member, kick);
    await logEvent(
      "eventLogging:onGuildMemberRemove",
      kick ? "memberKicked" : "memberLeft",
      embed,
      member.id,
      kick?.reason ? { reason: kick.reason } : undefined,
    );
  });
};
