import { Database } from "enmap-wrapper";
import Stumper from "stumper";

export default class BlueSkyDB extends Database {
  private readonly lastPostTimeKey = "lastPostTimeId";

  constructor() {
    super({ name: "blue-sky" });

    if (!this.db.has(this.lastPostTimeKey)) {
      this.db.set(this.lastPostTimeKey, "");
    }
  }

  setLastPostTime(newPostTime: string): void {
    this.db.set(this.lastPostTimeKey, newPostTime);
    Stumper.debug(`Setting last post id to: ${newPostTime}`, "blueSky:BlueSkyDB:setLastPostTime");
  }

  getLastPostTime(): string {
    return this.db.get(this.lastPostTimeKey);
  }
}
