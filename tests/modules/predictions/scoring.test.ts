import { calculatePoints, getPredictionOutcome, PredictionOutcome } from "@modules/predictions/utils/scoring";

describe("getPredictionOutcome", () => {
  it("returns EXACT when both scores match exactly", () => {
    expect(getPredictionOutcome(4, 2, 4, 2)).toBe(PredictionOutcome.EXACT);
  });

  it("returns CORRECT_WINNER when the home team wins in both but the score differs", () => {
    expect(getPredictionOutcome(5, 2, 3, 1)).toBe(PredictionOutcome.CORRECT_WINNER);
  });

  it("returns CORRECT_WINNER when the away team wins in both but the score differs", () => {
    expect(getPredictionOutcome(1, 4, 2, 5)).toBe(PredictionOutcome.CORRECT_WINNER);
  });

  it("returns INCORRECT when the predicted winner is wrong", () => {
    expect(getPredictionOutcome(4, 2, 2, 4)).toBe(PredictionOutcome.INCORRECT);
  });

  it("returns INCORRECT when a tie is predicted but the actual game had a winner", () => {
    expect(getPredictionOutcome(3, 3, 4, 3)).toBe(PredictionOutcome.INCORRECT);
  });
});

describe("calculatePoints", () => {
  it("awards exactScorePoints for an EXACT outcome", () => {
    expect(calculatePoints(PredictionOutcome.EXACT, 3, 1)).toBe(3);
  });

  it("awards correctWinnerPoints for a CORRECT_WINNER outcome", () => {
    expect(calculatePoints(PredictionOutcome.CORRECT_WINNER, 3, 1)).toBe(1);
  });

  it("awards zero points for an INCORRECT outcome", () => {
    expect(calculatePoints(PredictionOutcome.INCORRECT, 3, 1)).toBe(0);
  });
});
