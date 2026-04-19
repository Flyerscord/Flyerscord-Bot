import Task from "@common/models/Task";

import nhlApi from "nhl-api-wrapper-ts";
import CurrentGameManager from "../managers/CurrentGameManager";
import Stumper from "stumper";

export default class LiveDataTask extends Task {
  constructor() {
    // Run every 15 seconds
    super("PeriodNotifications", "*/15 * * * * *");
  }

  protected async execute(): Promise<void> {
    const gameId = CurrentGameManager.getInstance().getGameId();

    if (!gameId) {
      return;
    }

    const res = await nhlApi.games.events.getGameLandingPage({ gameId });

    if (res.status == 200) {
      const gameInfo = res.data;
    } else {
      Stumper.error(`Failed to get live data for game ${gameId}`, "nhl:LiveDataTask:execute");
    }
  }
}
