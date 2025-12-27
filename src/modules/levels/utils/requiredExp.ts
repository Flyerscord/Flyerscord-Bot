import Stumper from "stumper";
import LevelsDB from "../db/LevelsDB";

export async function calculateLevels(levelsToCalc: number): Promise<void> {
  const db = new LevelsDB();

  if ((await db.getNumberOfCalculatedLevels()) != levelsToCalc) {
    Stumper.warning(`Regenerating table of ${levelsToCalc} levels!`, "levels:requiredExp:calculateLevels");
    await db.deleteAllLevels();

    let currentTotal = 0;
    for (let i = 0; i < levelsToCalc; i++) {
      const expNeeded = expNeededForNextLevel(i);
      currentTotal += expNeeded;
      await db.addLevel(i + 1, currentTotal);
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
