import ClientManager from "@common/managers/ClientManager";
import { getMemberRemoveEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the guildMemberRemove listener that logs member leaves.
 * Does not attempt to distinguish a kick from a voluntary leave (both fire this same event) -
 * that would require an extra fetchAuditLogs call and is out of scope for this module.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildMemberRemove", async (member) => {
    const embed = getMemberRemoveEmbed(member);
    await logEvent("eventLogging:onGuildMemberRemove", "memberLeft", embed, member.id);
  });
};
