import ClientManager from "@common/managers/ClientManager";
import { getInviteEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the inviteCreate listener that logs invite creation.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("inviteCreate", async (invite) => {
    const embed = getInviteEmbed(true, invite);
    logEvent("inviteCreated", embed, invite.inviter?.id, { code: invite.code });
  });
};
