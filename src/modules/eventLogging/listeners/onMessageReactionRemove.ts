import ClientManager from "@common/managers/ClientManager";
import ConfigManager from "@common/managers/ConfigManager";
import { getReactionEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the messageReactionRemove listener that logs reaction removals, gated behind the logReactionEvents config toggle.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("messageReactionRemove", async (reaction, user) => {
    if (!ConfigManager.getInstance().getConfig("EventLogging").logReactionEvents) return;
    if (user.bot) return;

    const embed = getReactionEmbed(false, reaction, user);
    logEvent("reactionRemoved", embed, user.id, {
      channelId: reaction.message.channelId,
      messageId: reaction.message.id,
    });
  });
};
