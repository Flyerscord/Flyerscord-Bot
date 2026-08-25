import ClientManager from "@common/managers/ClientManager";
import { getEmojiEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the emojiUpdate listener that logs emoji updates.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("emojiUpdate", async (_oldEmoji, newEmoji) => {
    const embed = getEmojiEmbed("updated", newEmoji);
    logEvent("emojiUpdated", embed, undefined, { emojiId: newEmoji.id });
  });
};
