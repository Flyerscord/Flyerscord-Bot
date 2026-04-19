import ClientManager from "@common/managers/ClientManager";
import Time from "@common/utils/Time";

import nhlApi from "nhl-api-wrapper-ts";
import { TEAM_TRI_CODE } from "nhl-api-wrapper-ts/dist/interfaces/Common";
import GameStartTask from "../tasks/GameStartTask";
import CurrentGameManager from "../managers/CurrentGameManager";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("clientReady", async () => {
    const res = await nhlApi.teams.schedule.getCurrentTeamSchedule({ team: TEAM_TRI_CODE.PHILADELPHIA_FLYERS });

    if (res.status == 200) {
      const game = res.data.games.find((game) => Time.isSameDay(new Date(), new Date(game.startTimeUTC)));

      if (game) {
        const gameStartTask = GameStartTask.getInstance();
        if (!gameStartTask.isActive()) {
          const gameStartTime = new Date(game.startTimeUTC);
          gameStartTime.setMinutes(gameStartTime.getMinutes() - 10);
          gameStartTask.setDate(gameStartTime);

          CurrentGameManager.getInstance().setGame(game.id, gameStartTime);
        }
      }
    }
  });
};
