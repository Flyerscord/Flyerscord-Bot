import ClientManager from "@common/managers/ClientManager";
import { getScheduledEventEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the guildScheduledEventDelete listener that logs scheduled event deletion.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildScheduledEventDelete", async (event) => {
    const embed = getScheduledEventEmbed("deleted", event);
    await logEvent("eventLogging:onGuildScheduledEventDelete", "scheduledEventDeleted", embed, undefined, { eventId: event.id });
  });
};
