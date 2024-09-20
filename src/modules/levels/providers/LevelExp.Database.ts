import Database from "../../../common/providers/Database";

export default class LevelExpDB extends Database {
  private static instance: LevelExpDB;

  private constructor() {
    super({ name: "level-exp" });
  }

  static getInstance(): LevelExpDB {
    return this.instance || (this.instance = new this());
  }

  addLevel(level: number, expRequired: number): void {
    this.db.set(level, expRequired);
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
      return this.db.get(level);
    }
    return 0;
  }

  getExpUntilNextLevel(currentLevel: number, currentExp: number): number {
    const nextLevelExp = this.getLevelExp(currentLevel + 1);
    return nextLevelExp - currentExp;
  }

  private hasLevel(level: number): boolean {
    return this.db.has(level);
  }
}
