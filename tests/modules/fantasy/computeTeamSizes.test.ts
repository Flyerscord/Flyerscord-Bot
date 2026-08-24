import { computeTeamSizes } from "@modules/fantasy/utils/closeSeason";

describe("computeTeamSizes", () => {
  it("returns a single team of 8 for 8 signups", () => {
    expect(computeTeamSizes(8)).toEqual([8]);
  });

  it("returns a single team of 10 for 10 signups", () => {
    expect(computeTeamSizes(10)).toEqual([10]);
  });

  it("returns a single team of 12 for 12 signups", () => {
    expect(computeTeamSizes(12)).toEqual([12]);
  });

  it("prefers multiple teams of 10 when they divide evenly", () => {
    expect(computeTeamSizes(20)).toEqual([10, 10]);
    expect(computeTeamSizes(30)).toEqual([10, 10, 10]);
  });

  it("mixes team sizes when a pure size doesn't divide evenly", () => {
    // 22 doesn't divide evenly by 8, 10, or 12 alone, but one team of 10 and one of 12 does
    expect(computeTeamSizes(22)).toEqual([10, 12]);
  });

  it("maximizes the number of 10-player teams before falling back to other sizes", () => {
    // 28 = 2x10 + 1x8 (not 1x10 + 1x8 + 1x10 or other lower-10-count combos)
    expect(computeTeamSizes(28)).toEqual([10, 10, 8]);
  });

  it("prefers 12-player teams over 8-player teams when 10s don't fit", () => {
    // 24 = 2x12 (preferred) rather than 3x8, since no combination of 10s works
    expect(computeTeamSizes(24)).toEqual([12, 12]);
  });

  it("allows mixed sizes across more than two teams", () => {
    // 34 = 1x10 + 2x12
    expect(computeTeamSizes(34)).toEqual([10, 12, 12]);
  });

  it("returns an empty array for zero signups", () => {
    expect(computeTeamSizes(0)).toEqual([]);
  });

  it("returns undefined when no combination of 8, 10, or 12-player teams is possible", () => {
    expect(computeTeamSizes(6)).toBeUndefined();
    expect(computeTeamSizes(14)).toBeUndefined();
  });

  it("returns undefined for odd signup counts, since 8/10/12 are all even", () => {
    expect(computeTeamSizes(21)).toBeUndefined();
  });
});
