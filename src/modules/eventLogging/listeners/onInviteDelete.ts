import ClientManager from "@common/managers/ClientManager";
import { getInviteEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the inviteDelete listener that logs invite deletion.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("inviteDelete", async (invite) => {
    const embed = getInviteEmbed(false, invite);
    await logEvent("eventLogging:onInviteDelete", "inviteDeleted", embed, undefined, { code: invite.code });
  });
};
