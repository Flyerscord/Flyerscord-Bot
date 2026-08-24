import ClientManager from "@common/managers/ClientManager";
import { getChannelEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the channelCreate listener that logs channel creation.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("channelCreate", async (channel) => {
    const embed = getChannelEmbed("created", channel);
    await logEvent("eventLogging:onChannelCreate", "channelCreated", embed, undefined, { channelId: channel.id });
  });
};
