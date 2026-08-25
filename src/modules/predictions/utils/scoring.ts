import { PeriodType } from "../db/schema";

export enum PredictionOutcome {
  EXACT = "exact",
  EXACT_SCORE = "exact_score",
  CORRECT_WINNER = "correct_winner",
  INCORRECT = "incorrect",
}

type Winner = "home" | "away" | "tie";

function getWinner(homeScore: number, awayScore: number): Winner {
  if (homeScore === awayScore) {
    return "tie";
  }
  return homeScore > awayScore ? "home" : "away";
}

/**
 * Compares a predicted score and ending (regulation/OT/shootout) to the actual result.
 * @returns EXACT if the score and ending both match, EXACT_SCORE if only the score matches, CORRECT_WINNER if only the winning side matches, otherwise INCORRECT
 */
export function getPredictionOutcome(
  predictedHomeScore: number,
  predictedAwayScore: number,
  predictedPeriodType: PeriodType,
  actualHomeScore: number,
  actualAwayScore: number,
  actualPeriodType: PeriodType,
): PredictionOutcome {
  const scoreMatches = predictedHomeScore === actualHomeScore && predictedAwayScore === actualAwayScore;

  if (scoreMatches && predictedPeriodType === actualPeriodType) {
    return PredictionOutcome.EXACT;
  }
  if (scoreMatches) {
    return PredictionOutcome.EXACT_SCORE;
  }
  if (getWinner(predictedHomeScore, predictedAwayScore) === getWinner(actualHomeScore, actualAwayScore)) {
    return PredictionOutcome.CORRECT_WINNER;
  }
  return PredictionOutcome.INCORRECT;
}

/**
 * Converts a prediction outcome into the number of points it earns.
 */
export function calculatePoints(outcome: PredictionOutcome, exactPoints: number, exactScorePoints: number, correctWinnerPoints: number): number {
  if (outcome === PredictionOutcome.EXACT) {
    return exactPoints;
  }
  if (outcome === PredictionOutcome.EXACT_SCORE) {
    return exactScorePoints;
  }
  if (outcome === PredictionOutcome.CORRECT_WINNER) {
    return correctWinnerPoints;
  }
  return 0;
}
