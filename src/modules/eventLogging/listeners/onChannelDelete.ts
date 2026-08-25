import ClientManager from "@common/managers/ClientManager";
import { getChannelEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the channelDelete listener that logs channel deletion.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("channelDelete", async (channel) => {
    const embed = getChannelEmbed("deleted", channel);
    logEvent("channelDeleted", embed, undefined, { channelId: channel.id });
  });
};
