import { IClubScheduleOutput_games } from "nhl-api-wrapper-ts/dist/interfaces/club/schedule/ClubSchedule";
import PredictionsDB from "../db/PredictionsDB";
import ResolveGameTask from "../tasks/ResolveGameTask";

/**
 * Ensures the resolution task is scheduled to fire at the given game's start time. A no-op if this
 * game is already the one being tracked, e.g. armed by an earlier submission or re-armed on startup.
 * @param game - The game predictions were just submitted for
 */
export async function armResolutionForGame(game: IClubScheduleOutput_games): Promise<void> {
  const db = new PredictionsDB();
  const state = await db.getState();

  if (state?.gameId === game.id) {
    return;
  }

  const gameStartTime = new Date(game.startTimeUTC);
  await db.setState(game.id, game.season, gameStartTime);
  ResolveGameTask.getInstance().setDate(gameStartTime);
}
