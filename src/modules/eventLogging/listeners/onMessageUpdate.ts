import ClientManager from "@common/managers/ClientManager";
import { getMessageUpdateEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the messageUpdate listener that logs message edits.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("messageUpdate", async (oldMessage, newMessage) => {
    if (newMessage.author?.bot) return;
    if (!oldMessage.partial && oldMessage.content === newMessage.content) return;

    const embed = getMessageUpdateEmbed(oldMessage, newMessage);
    logEvent("messageEdited", embed, newMessage.author?.id, {
      channelId: newMessage.channelId,
      messageId: newMessage.id,
    });
  });
};
