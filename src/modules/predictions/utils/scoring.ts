export enum PredictionOutcome {
  EXACT = "exact",
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
 * Compares a predicted score to the actual final score.
 * @returns EXACT if both scores match exactly, CORRECT_WINNER if only the winning side matches, otherwise INCORRECT
 */
export function getPredictionOutcome(
  predictedHomeScore: number,
  predictedAwayScore: number,
  actualHomeScore: number,
  actualAwayScore: number,
): PredictionOutcome {
  if (predictedHomeScore === actualHomeScore && predictedAwayScore === actualAwayScore) {
    return PredictionOutcome.EXACT;
  }
  if (getWinner(predictedHomeScore, predictedAwayScore) === getWinner(actualHomeScore, actualAwayScore)) {
    return PredictionOutcome.CORRECT_WINNER;
  }
  return PredictionOutcome.INCORRECT;
}

/**
 * Converts a prediction outcome into the number of points it earns.
 */
export function calculatePoints(outcome: PredictionOutcome, exactScorePoints: number, correctWinnerPoints: number): number {
  if (outcome === PredictionOutcome.EXACT) {
    return exactScorePoints;
  }
  if (outcome === PredictionOutcome.CORRECT_WINNER) {
    return correctWinnerPoints;
  }
  return 0;
}
