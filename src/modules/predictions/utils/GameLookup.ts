import nhlApi from "nhl-api-wrapper-ts";
import { TEAM_TRI_CODE } from "nhl-api-wrapper-ts/dist/interfaces/Common";
import { IClubScheduleOutput_games } from "nhl-api-wrapper-ts/dist/interfaces/club/schedule/ClubSchedule";

/**
 * Gets the next Flyers game that hasn't started yet, i.e. the game predictions should currently target.
 * @returns The next upcoming game, or undefined if none is scheduled or the schedule fetch failed
 */
export async function getNextPredictableGame(): Promise<IClubScheduleOutput_games | undefined> {
  const res = await nhlApi.teams.schedule.getCurrentTeamSchedule({ team: TEAM_TRI_CODE.PHILADELPHIA_FLYERS });
  if (res.status !== 200) {
    return undefined;
  }
  return res.data.games.find((game) => game.gameState === "FUT");
}
