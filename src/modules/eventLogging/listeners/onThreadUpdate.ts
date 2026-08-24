import ClientManager from "@common/managers/ClientManager";
import { getThreadArchiveEmbed, getThreadUpdateEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the threadUpdate listener that logs thread archive/unarchive and other metadata updates.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("threadUpdate", async (oldThread, newThread) => {
    if (oldThread.archived !== newThread.archived) {
      const embed = getThreadArchiveEmbed(newThread, Boolean(newThread.archived));
      await logEvent("eventLogging:onThreadUpdate", newThread.archived ? "threadArchived" : "threadUnarchived", embed, undefined, {
        threadId: newThread.id,
      });
      return;
    }

    if (oldThread.name === newThread.name) return;

    const embed = getThreadUpdateEmbed(oldThread, newThread);
    await logEvent("eventLogging:onThreadUpdate", "threadUpdated", embed, undefined, { threadId: newThread.id });
  });
};
