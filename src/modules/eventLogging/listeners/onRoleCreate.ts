import ClientManager from "@common/managers/ClientManager";
import { getRoleEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the roleCreate listener that logs role creation.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("roleCreate", async (role) => {
    const embed = getRoleEmbed("created", role);
    logEvent("roleCreated", embed, undefined, { roleId: role.id });
  });
};
