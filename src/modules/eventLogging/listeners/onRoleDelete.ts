import ClientManager from "@common/managers/ClientManager";
import { getRoleEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the roleDelete listener that logs role deletion.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("roleDelete", async (role) => {
    const embed = getRoleEmbed("deleted", role);
    await logEvent("eventLogging:onRoleDelete", "roleDeleted", embed, undefined, { roleId: role.id });
  });
};
