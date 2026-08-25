import ClientManager from "@common/managers/ClientManager";
import ConfigManager from "@common/managers/ConfigManager";
import { getReactionEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the messageReactionAdd listener that logs reaction adds, gated behind the logReactionEvents config toggle.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("messageReactionAdd", async (reaction, user) => {
    if (!ConfigManager.getInstance().getConfig("EventLogging").logReactionEvents) return;
    if (user.bot) return;

    const embed = getReactionEmbed(true, reaction, user);
    logEvent("reactionAdded", embed, user.id, {
      channelId: reaction.message.channelId,
      messageId: reaction.message.id,
    });
  });
};
