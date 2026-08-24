import ClientManager from "@common/managers/ClientManager";
import { getGuildUpdateEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the guildUpdate listener that logs server settings changes.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildUpdate", async (oldGuild, newGuild) => {
    if (oldGuild.name === newGuild.name && oldGuild.icon === newGuild.icon) return;

    const embed = getGuildUpdateEmbed(oldGuild, newGuild);
    await logEvent("eventLogging:onGuildUpdate", "guildUpdated", embed);
  });
};
