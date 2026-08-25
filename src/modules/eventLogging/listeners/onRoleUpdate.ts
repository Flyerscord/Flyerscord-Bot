import ClientManager from "@common/managers/ClientManager";
import { getRoleEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the roleUpdate listener that logs role updates.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("roleUpdate", async (_oldRole, newRole) => {
    const embed = getRoleEmbed("updated", newRole);
    logEvent("roleUpdated", embed, undefined, { roleId: newRole.id });
  });
};
