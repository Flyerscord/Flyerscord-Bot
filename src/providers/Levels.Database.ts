import Database from "./Database";

export default class LevelsDB extends Database {
  private static instance: LevelsDB;

  readonly levelToCalculateTo = 200;

  private constructor() {
    super({ name: "levels" });
  }

  static getInstance(): LevelsDB {
    return this.instance || (this.instance = new this());
  }

  hasLevel(level: number): boolean {
    return this.db.has(level);
  }

  setLevel(level: number, totalExp: number): void {
    this.db.set(level, totalExp);
  }

  getLevel(level: number): number | undefined {
    return this.db.get(level);
  }

  isFilled(): boolean {
    return this.db.size == this.levelToCalculateTo && this.hasLevel(this.levelToCalculateTo);
  }
}
