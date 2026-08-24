import ClientManager from "@common/managers/ClientManager";
import { getScheduledEventEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the guildScheduledEventCreate listener that logs scheduled event creation.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildScheduledEventCreate", async (event) => {
    const embed = getScheduledEventEmbed("created", event);
    await logEvent("eventLogging:onGuildScheduledEventCreate", "scheduledEventCreated", embed, undefined, { eventId: event.id });
  });
};
