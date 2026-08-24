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
    expect(computeTeamSizes(22, SkillLevel.INTERMEDIATE)).toEqual([12, 10]);
  });

  it("maximizes the number of 10-player teams before falling back to other sizes", () => {
    // 28 = 2x10 + 1x8, not 1x10 + 2x14 or other combos that use fewer 10s; 8 isn't preferred for
    // Intermediate, but it's still reached for since no all-preferred combination sums to 28
    expect(computeTeamSizes(28, SkillLevel.INTERMEDIATE)).toEqual([8, 10, 10]);
  });

  it("prefers 12-player teams over 8-player teams when 10s don't fit", () => {
    // 24 = 2x12 (preferred for Intermediate) rather than 3x8, since no combination of 10s works
    expect(computeTeamSizes(24, SkillLevel.INTERMEDIATE)).toEqual([12, 12]);
  });

  it("allows mixed sizes across more than two teams", () => {
    // 34 = 2x12 + 1x10
    expect(computeTeamSizes(34, SkillLevel.INTERMEDIATE)).toEqual([12, 12, 10]);
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
      expect(computeTeamSizes(20, SkillLevel.BEGINNER)).toEqual([10, 10]);
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

    it("prefers a nearby non-preferred size over a farther one for Beginner when falling back", () => {
      // 22 doesn't split into any combination of Beginner's preferred 8/10-player teams alone, so it
      // falls back to a 12-player team (the closest non-preferred size) rather than jumping to 14 or 16
      expect(computeTeamSizes(22, SkillLevel.BEGINNER)).toEqual([12, 10]);
    });

    it("avoids 8-player teams for Expert unless no other combination works", () => {
      // 8 signups can only ever form a single team of 8, so Expert is forced to use it
      expect(computeTeamSizes(8, SkillLevel.EXPERT)).toEqual([8]);
    });

    it("prefers two 10-player teams over reaching for an 8-player team for Expert", () => {
      // 20 doesn't split into any combination of Expert's preferred 12/14/16-player teams alone, and a
      // single 12-player team would force an 8-player team for the remainder. Two 10-player teams cover
      // it without touching the least-preferred size at all, so that's preferred instead.
      expect(computeTeamSizes(20, SkillLevel.EXPERT)).toEqual([10, 10]);
    });
  });

  describe("signup splits from 16 to 30 signups", () => {
    it.each([
      [16, [8, 8]],
      [18, [8, 10]],
      [20, [10, 10]],
      [22, [12, 10]],
      [24, [8, 8, 8]],
      [26, [8, 8, 10]],
      [28, [8, 10, 10]],
      [30, [10, 10, 10]],
    ])("splits %i Beginner signups into %j", (signupCount, expected) => {
      expect(computeTeamSizes(signupCount, SkillLevel.BEGINNER)).toEqual(expected);
    });

    it.each([
      [16, [8, 8]],
      [18, [8, 10]],
      [20, [10, 10]],
      [22, [12, 10]],
      [24, [12, 12]],
      [26, [8, 8, 10]],
      [28, [8, 10, 10]],
      [30, [10, 10, 10]],
    ])("splits %i Intermediate signups into %j", (signupCount, expected) => {
      expect(computeTeamSizes(signupCount, SkillLevel.INTERMEDIATE)).toEqual(expected);
    });

    it.each([
      [16, [16]],
      [18, [8, 10]],
      [20, [10, 10]],
      [22, [10, 12]],
      [24, [12, 12]],
      [26, [14, 12]],
      [28, [14, 14]],
      [30, [16, 14]],
    ])("splits %i Expert signups into %j", (signupCount, expected) => {
      expect(computeTeamSizes(signupCount, SkillLevel.EXPERT)).toEqual(expected);
    });
  });
});
