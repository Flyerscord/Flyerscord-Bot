import Stumper from "stumper";
import Database from "../../../common/providers/Database";

export default class LevelExpDB extends Database {
  constructor() {
    super({ name: "level-exp" });
  }

  addLevel(level: number, expRequired: number): void {
    this.db.set(level.toString(), expRequired);
  }

  getLevelFromExp(exp: number): number {
    for (const [level, expRequired] of this.db.entries()) {
      if (exp >= expRequired) {
        return Number(level);
      }
    }
    return 0;
  }

  getLevelExp(level: number): number {
    if (this.hasLevel(level)) {
      return this.db.get(level.toString());
    }
    return 0;
  }

  getExpUntilNextLevel(currentLevel: number, currentExp: number): number {
    Stumper.debug(`Getting exp until next level for level ${currentLevel} and current exp ${currentExp}`, "levels:LevelExpDB:getExpUntilNextLevel");
    const nextLevelExp = this.getLevelExp(currentLevel + 1);
    Stumper.debug(`Next level exp: ${nextLevelExp}`, "levels:LevelExpDB:getExpUntilNextLevel");
    return nextLevelExp - currentExp;
  }

  private hasLevel(level: number): boolean {
    return this.db.has(level.toString());
  }
}
