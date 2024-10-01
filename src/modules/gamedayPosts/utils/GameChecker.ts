import nhlApi from "nhl-api-wrapper-ts";
import { TEAM_TRI_CODE } from "nhl-api-wrapper-ts/dist/interfaces/Common";
import Time from "../../../common/utils/Time";

import discord from "../../../common/utils/discord/discord";
import { time, TimestampStyles } from "discord.js";

export default async function checkForGameDay(): Promise<void> {
  const res = await nhlApi.teams.schedule.getCurrentTeamSchedule({ team: TEAM_TRI_CODE.PHILADELPHIA_FLYERS });

  if (res.status == 200) {
    const game = res.data.games.find((game) => Time.isSameDay(new Date(), new Date(game.gameDate)));

    if (game) {
      const teamsRes = await nhlApi.teams.getTeams({ lang: "en" });

      if (teamsRes.status == 200) {
        const teams = teamsRes.data.data;

        const homeTeam = teams.find((team) => team.id == game.homeTeam.id);
        const awayTeam = teams.find((team) => team.id == game.awayTeam.id);

        if (homeTeam && awayTeam) {
          // TODO: Fix me. Add channel id to config file
          discord.channels.createPost(
            "",
            `${awayTeam.fullName} @ ${homeTeam.fullName}`,
            `${time(new Date(game.startTimeUTC), TimestampStyles.LongDateTime)}`,
          );
        }
      }
    }
  }
}
