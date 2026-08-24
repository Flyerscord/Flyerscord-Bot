import ClientManager from "@common/managers/ClientManager";
import { getStickerEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the stickerCreate listener that logs sticker creation.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("stickerCreate", async (sticker) => {
    const embed = getStickerEmbed("created", sticker);
    await logEvent("eventLogging:onStickerCreate", "stickerCreated", embed, undefined, { stickerId: sticker.id });
  });
};
