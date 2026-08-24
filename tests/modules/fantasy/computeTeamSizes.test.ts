import { computeTeamSizes } from "@modules/fantasy/utils/closeSeason";
import { SkillLevel } from "@modules/fantasy/db/schema";

describe("computeTeamSizes", () => {
  it("returns a single team of 8 for 8 signups", () => {
    expect(computeTeamSizes(8, SkillLevel.BEGINNER)).toEqual([8]);
  });

  it("returns a single team of 10 for 10 signups", () => {
    expect(computeTeamSizes(10, SkillLevel.INTERMEDIATE)).toEqual([10]);
  });

  it("returns a single team of 12 for 12 signups", () => {
    expect(computeTeamSizes(12, SkillLevel.INTERMEDIATE)).toEqual([12]);
  });

  it("prefers multiple teams of 10 when they divide evenly", () => {
    expect(computeTeamSizes(20, SkillLevel.INTERMEDIATE)).toEqual([10, 10]);
    expect(computeTeamSizes(30, SkillLevel.INTERMEDIATE)).toEqual([10, 10, 10]);
  });

  it("mixes team sizes when a pure size doesn't divide evenly", () => {
    // 22 doesn't divide evenly by 10 or 12 alone, but one team of 10 and one of 12 does
    expect(computeTeamSizes(22, SkillLevel.INTERMEDIATE)).toEqual([10, 12]);
  });

  it("maximizes the number of 10-player teams before falling back to other sizes", () => {
    // 28 = 2x10 + 1x8 (not 1x10 + 1x8 + 1x10 or other lower-10-count combos); 8 isn't preferred for
    // Intermediate, but it's still reached for since no all-preferred combination sums to 28
    expect(computeTeamSizes(28, SkillLevel.INTERMEDIATE)).toEqual([10, 10, 8]);
  });

  it("prefers 12-player teams over 8-player teams when 10s don't fit", () => {
    // 24 = 2x12 (preferred for Intermediate) rather than 3x8, since no combination of 10s works
    expect(computeTeamSizes(24, SkillLevel.INTERMEDIATE)).toEqual([12, 12]);
  });

  it("allows mixed sizes across more than two teams", () => {
    // 34 = 1x10 + 2x12
    expect(computeTeamSizes(34, SkillLevel.INTERMEDIATE)).toEqual([10, 12, 12]);
  });

  it("returns an empty array for zero signups", () => {
    expect(computeTeamSizes(0, SkillLevel.INTERMEDIATE)).toEqual([]);
  });

  it("returns undefined when no combination of valid team sizes is possible", () => {
    expect(computeTeamSizes(6, SkillLevel.INTERMEDIATE)).toBeUndefined();
    expect(computeTeamSizes(4, SkillLevel.EXPERT)).toBeUndefined();
  });

  it("returns undefined for odd signup counts, since all valid team sizes are even", () => {
    expect(computeTeamSizes(21, SkillLevel.INTERMEDIATE)).toBeUndefined();
  });

  describe("skill level preferences", () => {
    it("sticks to 8 and 10-player teams for Beginner when they divide evenly", () => {
      expect(computeTeamSizes(16, SkillLevel.BEGINNER)).toEqual([8, 8]);
      expect(computeTeamSizes(18, SkillLevel.BEGINNER)).toEqual([8, 10]);
    });

    it("sticks to 12, 14, and 16-player teams for Expert when they divide evenly", () => {
      expect(computeTeamSizes(12, SkillLevel.EXPERT)).toEqual([12]);
      expect(computeTeamSizes(36, SkillLevel.EXPERT)).toEqual([12, 12, 12]);
    });

    it("falls back to a non-preferred size when no preferred combination works", () => {
      // 14 signups can't split into any combination of Beginner's preferred 8/10-player teams, so it
      // falls back to a single team of 14 even though that's not a Beginner-preferred size
      expect(computeTeamSizes(14, SkillLevel.BEGINNER)).toEqual([14]);
    });

    it("avoids 8-player teams for Expert unless no other combination works", () => {
      // 8 signups can only ever form a single team of 8, so Expert is forced to use it
      expect(computeTeamSizes(8, SkillLevel.EXPERT)).toEqual([8]);
    });
  });
});
