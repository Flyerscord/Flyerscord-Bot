import { PeriodType } from "@modules/predictions/db/schema";
import { calculatePoints, getPredictionOutcome, PredictionOutcome } from "@modules/predictions/utils/scoring";

describe("getPredictionOutcome", () => {
  it("returns EXACT when the score and ending both match", () => {
    expect(getPredictionOutcome(4, 2, PeriodType.REGULATION, 4, 2, PeriodType.REGULATION)).toBe(PredictionOutcome.EXACT);
  });

  it("returns EXACT_SCORE when the score matches but the ending doesn't", () => {
    expect(getPredictionOutcome(4, 3, PeriodType.REGULATION, 4, 3, PeriodType.OVERTIME)).toBe(PredictionOutcome.EXACT_SCORE);
    expect(getPredictionOutcome(4, 3, PeriodType.OVERTIME, 4, 3, PeriodType.SHOOTOUT)).toBe(PredictionOutcome.EXACT_SCORE);
  });

  it("returns CORRECT_WINNER when the home team wins in both but the score differs", () => {
    expect(getPredictionOutcome(5, 2, PeriodType.REGULATION, 3, 1, PeriodType.REGULATION)).toBe(PredictionOutcome.CORRECT_WINNER);
  });

  it("returns CORRECT_WINNER when the away team wins in both but the score differs", () => {
    expect(getPredictionOutcome(1, 4, PeriodType.REGULATION, 2, 5, PeriodType.REGULATION)).toBe(PredictionOutcome.CORRECT_WINNER);
  });

  it("returns INCORRECT when the predicted winner is wrong", () => {
    expect(getPredictionOutcome(4, 2, PeriodType.REGULATION, 2, 4, PeriodType.REGULATION)).toBe(PredictionOutcome.INCORRECT);
  });

  it("returns INCORRECT when a tie is predicted but the actual game had a winner", () => {
    expect(getPredictionOutcome(3, 3, PeriodType.REGULATION, 4, 3, PeriodType.OVERTIME)).toBe(PredictionOutcome.INCORRECT);
  });
});

describe("calculatePoints", () => {
  it("awards exactPoints for an EXACT outcome", () => {
    expect(calculatePoints(PredictionOutcome.EXACT, 3, 2, 1)).toBe(3);
  });

  it("awards exactScorePoints for an EXACT_SCORE outcome", () => {
    expect(calculatePoints(PredictionOutcome.EXACT_SCORE, 3, 2, 1)).toBe(2);
  });

  it("awards correctWinnerPoints for a CORRECT_WINNER outcome", () => {
    expect(calculatePoints(PredictionOutcome.CORRECT_WINNER, 3, 2, 1)).toBe(1);
  });

  it("awards zero points for an INCORRECT outcome", () => {
    expect(calculatePoints(PredictionOutcome.INCORRECT, 3, 2, 1)).toBe(0);
  });
});
