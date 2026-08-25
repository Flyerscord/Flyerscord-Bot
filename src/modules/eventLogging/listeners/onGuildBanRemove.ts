import ClientManager from "@common/managers/ClientManager";
import { getBanEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the guildBanRemove listener that logs member unbans.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildBanRemove", async (ban) => {
    const embed = getBanEmbed(false, ban);
    logEvent("memberUnbanned", embed, ban.user.id);
  });
};
