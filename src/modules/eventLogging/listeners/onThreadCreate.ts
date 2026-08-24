import ClientManager from "@common/managers/ClientManager";
import { getThreadEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the threadCreate listener that logs thread creation.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("threadCreate", async (thread) => {
    const embed = getThreadEmbed("created", thread);
    await logEvent("eventLogging:onThreadCreate", "threadCreated", embed, undefined, { threadId: thread.id });
  });
};
