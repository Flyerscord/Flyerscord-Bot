import ClientManager from "@common/managers/ClientManager";
import { getChannelEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the channelUpdate listener that logs channel updates.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("channelUpdate", async (_oldChannel, newChannel) => {
    const embed = getChannelEmbed("updated", newChannel);
    logEvent("channelUpdated", embed, undefined, { channelId: newChannel.id });
  });
};
