import Stumper from "stumper";
import LevelExpDB from "../providers/LevelExp.Database";

export function calculateLevels(levelsToCalc: number): void {
  const db = LevelExpDB.getInstance();

  if (db.getNumOfKeys() != levelsToCalc) {
    Stumper.warning(`Regenerating table of ${levelsToCalc} levels!`, "levels:requiredExp:calculateLevels");
    db.wipe();

    let currentTotal = 0;
    for (let i = 0; i < levelsToCalc; i++) {
      const expNeeded = expNeededForNextLevel(i);
      currentTotal += expNeeded;
      db.addLevel(i + 1, currentTotal);
    }
  } else {
    Stumper.debug(`Skipping the generation of the table of levels`, "levels:requiredExp:calculateLevels");
  }
}

function expNeededForNextLevel(currentLevel: number): number {
  // The formula that mee6 uses (from their old docs)
  // 5 * (lvl ^ 2) + (50 * lvl) + 100 - xp
  return 5 * Math.pow(currentLevel, 2) + 50 * currentLevel + 100;
}
