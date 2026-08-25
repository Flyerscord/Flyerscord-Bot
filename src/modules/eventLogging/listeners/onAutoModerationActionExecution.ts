import ClientManager from "@common/managers/ClientManager";
import { getAutoModerationEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the autoModerationActionExecution listener that logs AutoMod rule triggers.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("autoModerationActionExecution", async (execution) => {
    const embed = getAutoModerationEmbed(execution);
    logEvent("autoModTriggered", embed, execution.userId, {
      ruleId: execution.ruleId,
    });
  });
};
