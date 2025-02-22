import Stumper from "stumper";
import Database from "../../../common/providers/Database";

export default class BlueSkyDB extends Database {
  private static instance: BlueSkyDB;

  private readonly lastPostTimeKey = "lastPostTimeId";

  constructor() {
    super({ name: "blue-sky" });

    if (!this.db.has(this.lastPostTimeKey)) {
      this.db.set(this.lastPostTimeKey, "");
    }
  }

  static getInstance(): BlueSkyDB {
    return this.instance || (this.instance = new this());
  }

  setLastPostTime(newPostTime: string): void {
    this.db.set(this.lastPostTimeKey, newPostTime);
    Stumper.debug(`Setting last post id to: ${newPostTime}`, "blueSky:BlueSkyDB:setLastPostTime");
  }

  getLastPostTime(): string {
    return this.db.get(this.lastPostTimeKey);
  }
}
