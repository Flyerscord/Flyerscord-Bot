import ClientManager from "@common/managers/ClientManager";
import { getEmojiEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the emojiCreate listener that logs emoji creation.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("emojiCreate", async (emoji) => {
    const embed = getEmojiEmbed("created", emoji);
    logEvent("emojiCreated", embed, undefined, { emojiId: emoji.id });
  });
};
