import ClientManager from "@common/managers/ClientManager";
import { getBanEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the guildBanAdd listener that logs member bans.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildBanAdd", async (ban) => {
    const embed = getBanEmbed(true, ban);
    await logEvent("eventLogging:onGuildBanAdd", "memberBanned", embed, ban.user.id, { reason: ban.reason ?? undefined });
  });
};
