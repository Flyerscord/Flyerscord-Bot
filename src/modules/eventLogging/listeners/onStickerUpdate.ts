import ClientManager from "@common/managers/ClientManager";
import { getStickerEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the stickerUpdate listener that logs sticker updates.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("stickerUpdate", async (_oldSticker, newSticker) => {
    const embed = getStickerEmbed("updated", newSticker);
    await logEvent("eventLogging:onStickerUpdate", "stickerUpdated", embed, undefined, { stickerId: newSticker.id });
  });
};
