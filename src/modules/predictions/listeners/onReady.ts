import ClientManager from "@common/managers/ClientManager";
import Stumper from "stumper";
import PredictionsDB from "../db/PredictionsDB";
import ResolveGameTask from "../tasks/ResolveGameTask";
import PollGameResultTask from "../tasks/PollGameResultTask";

/**
 * Restores the resolution scheduling for a tracked game after a bot restart: re-arms the ephemeral
 * task if the game's start time is still in the future, or starts polling immediately if it already
 * passed while the bot was down.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("clientReady", async () => {
    const db = new PredictionsDB();
    const state = await db.getState();
    if (!state || !state.gameId || !state.gameStartTime) {
      return;
    }

    if (state.gameStartTime.getTime() < Date.now()) {
      Stumper.warning(
        `Predictions game start time already passed for game ${state.gameId}, starting PollGameResultTask immediately...`,
        "predictions:onReady:onReady",
      );
      PollGameResultTask.getInstance().createScheduledJob();
    } else {
      ResolveGameTask.getInstance().setDate(state.gameStartTime);
    }
  });
};
