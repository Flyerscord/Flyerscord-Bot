import ClientManager from "@common/managers/ClientManager";
import { getScheduledEventEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the guildScheduledEventUpdate listener that logs scheduled event updates.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildScheduledEventUpdate", async (_oldEvent, newEvent) => {
    const embed = getScheduledEventEmbed("updated", newEvent);
    logEvent("scheduledEventUpdated", embed, undefined, { eventId: newEvent.id });
  });
};
