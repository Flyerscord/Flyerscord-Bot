import LevelsDB from "../providers/Levels.Database";
import Logger from "./Logger";

export default abstract class Levels {
  static getRandomExpAmount(): number {
    const minExp = 15;
    const maxExp = 25;

    return Math.floor(Math.random() * (maxExp - minExp + 1)) + minExp;
  }

  static getExpForNextLevel(currentLevel: number): number {
    return 5 * Math.pow(currentLevel, 2) + 50 * currentLevel + 100;
  }

  static calculateExpNeededForLevels(): void {
    const db = LevelsDB.getInstance();

    if (!db.isFilled()) {
      Logger.info("Generating exp required for levels", "calculateExpNeededForLevels");
      db.wipe();
      let totalExp = 0;
      const maxLevel = db.levelToCalculateTo;

      for (let i = 0; i < maxLevel; i++) {
        const expForLevel = this.getExpForNextLevel(i);
        totalExp += expForLevel;
        db.setLevel(i + 1, totalExp);
      }
    }
  }
}
