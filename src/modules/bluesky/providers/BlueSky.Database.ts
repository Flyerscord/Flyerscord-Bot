import Stumper from "stumper";
import Database from "../../../common/providers/Database";

export default class BlueSkyDB extends Database {
  private static instance: BlueSkyDB;

  private readonly postIdKey = "lastPostId";

  constructor() {
    super({ name: "blue-sky" });

    if (!this.db.has(this.postIdKey)) {
      this.db.set(this.postIdKey, "");
    }
  }

  static getInstance(): BlueSkyDB {
    return this.instance || (this.instance = new this());
  }

  setLastPostId(newPostId: string): void {
    this.db.set(this.postIdKey, newPostId);
    Stumper.debug(`Setting last post id to: ${newPostId}`, "blueSky:BlueSkyDB:setLastPostId");
  }

  getLastPostId(): string {
    return this.db.get(this.postIdKey);
  }
}
