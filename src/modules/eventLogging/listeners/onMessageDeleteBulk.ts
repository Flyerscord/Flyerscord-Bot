import ClientManager from "@common/managers/ClientManager";
import { getMessageDeleteBulkEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the messageDeleteBulk listener that logs bulk message deletions.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("messageDeleteBulk", async (messages, channel) => {
    const embed = getMessageDeleteBulkEmbed(messages.size, channel);
    logEvent("messagesBulkDeleted", embed, undefined, {
      channelId: channel.id,
      count: messages.size,
    });
  });
};
