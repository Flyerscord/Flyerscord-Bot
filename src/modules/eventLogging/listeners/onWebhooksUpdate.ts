import ClientManager from "@common/managers/ClientManager";
import { getWebhooksUpdateEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the webhooksUpdate listener that logs webhook changes in a channel.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("webhooksUpdate", async (channel) => {
    const embed = getWebhooksUpdateEmbed(channel);
    await logEvent("eventLogging:onWebhooksUpdate", "webhooksUpdated", embed, undefined, { channelId: channel.id });
  });
};
