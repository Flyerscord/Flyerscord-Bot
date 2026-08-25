import ClientManager from "@common/managers/ClientManager";
import { getMessageDeleteEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the messageDelete listener that logs message deletions.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("messageDelete", async (message) => {
    if (message.author?.bot) return;

    const embed = getMessageDeleteEmbed(message);
    logEvent("messageDeleted", embed, message.author?.id, {
      channelId: message.channelId,
      messageId: message.id,
    });
  });
};
