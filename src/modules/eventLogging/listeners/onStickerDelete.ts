import ClientManager from "@common/managers/ClientManager";
import { getStickerEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the stickerDelete listener that logs sticker deletion.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("stickerDelete", async (sticker) => {
    const embed = getStickerEmbed("deleted", sticker);
    await logEvent("eventLogging:onStickerDelete", "stickerDeleted", embed, undefined, { stickerId: sticker.id });
  });
};
