import PredictionsDB from "../db/PredictionsDB";
import { getNextPredictableGame } from "./GameLookup";

export const CURRENT_SEASON_OPTION = "current";
export const ALL_TIME_SEASON_OPTION = "all-time";

export interface ResolvedSeasonOption {
  season: number | undefined;
  label: string;
}

/**
 * Resolves a user-provided season option (`current`, `all-time`, or a season number like `20252026`)
 * into a concrete season number to filter the leaderboard by, or undefined to mean "all-time".
 * @param db - The predictions database, used to fall back to the most recent season when there's no upcoming game
 * @param seasonOption - The raw option value from the command
 * @returns undefined if the option string isn't `current`, `all-time`, or a valid integer
 */
export async function resolveSeasonOption(db: PredictionsDB, seasonOption: string): Promise<ResolvedSeasonOption | undefined> {
  if (seasonOption === ALL_TIME_SEASON_OPTION) {
    return { season: undefined, label: "All-Time" };
  }

  if (seasonOption === CURRENT_SEASON_OPTION) {
    const game = await getNextPredictableGame();
    if (game) {
      return { season: game.season, label: `Season ${game.season}` };
    }
    const seasons = await db.getDistinctSeasons();
    const season = seasons[0];
    return { season, label: season ? `Season ${season}` : "Current Season" };
  }

  const parsed = Number(seasonOption);
  if (!Number.isInteger(parsed)) {
    return undefined;
  }
  return { season: parsed, label: `Season ${parsed}` };
}

/**
 * Gets the autocomplete choices for a "season" string option: `current`, `all-time`, and every season
 * that has at least one prediction on record.
 */
export async function getSeasonAutocompleteOptions(db: PredictionsDB): Promise<string[]> {
  const seasons = await db.getDistinctSeasons();
  return [CURRENT_SEASON_OPTION, ALL_TIME_SEASON_OPTION, ...seasons.map((season) => season.toString())];
}
