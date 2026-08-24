import ClientManager from "@common/managers/ClientManager";
import { getMemberAddEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the guildMemberAdd listener that logs member joins.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildMemberAdd", async (member) => {
    const embed = getMemberAddEmbed(member);
    await logEvent("eventLogging:onGuildMemberAdd", "memberJoined", embed, member.id);
  });
};
