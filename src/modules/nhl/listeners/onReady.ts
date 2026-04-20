import ClientManager from "@common/managers/ClientManager";
import Time from "@common/utils/Time";

import nhlApi from "nhl-api-wrapper-ts";
import { TEAM_TRI_CODE } from "nhl-api-wrapper-ts/dist/interfaces/Common";
import { setupLiveData } from "../utils/GameChecker";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("clientReady", async () => {
    const res = await nhlApi.teams.schedule.getCurrentTeamSchedule({ team: TEAM_TRI_CODE.PHILADELPHIA_FLYERS });

    if (res.status == 200) {
      const game = res.data.games.find((game) => Time.isSameDay(new Date(), new Date(game.startTimeUTC)));

      if (game) {
        await setupLiveData(game);
      }
    }
  });
};
