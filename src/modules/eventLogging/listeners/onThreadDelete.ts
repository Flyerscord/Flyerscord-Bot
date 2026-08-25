import ClientManager from "@common/managers/ClientManager";
import { getThreadEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the threadDelete listener that logs thread deletion.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("threadDelete", async (thread) => {
    const embed = getThreadEmbed("deleted", thread);
    logEvent("threadDeleted", embed, undefined, { threadId: thread.id });
  });
};
