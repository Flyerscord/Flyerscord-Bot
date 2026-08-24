import ClientManager from "@common/managers/ClientManager";
import { getEmojiEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the emojiDelete listener that logs emoji deletion.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("emojiDelete", async (emoji) => {
    const embed = getEmojiEmbed("deleted", emoji);
    await logEvent("eventLogging:onEmojiDelete", "emojiDeleted", embed, undefined, { emojiId: emoji.id });
  });
};
