import Stumper from "stumper";
import Database from "../../../common/providers/Database";

export default class BlueSkyDB extends Database {
  private static instance: BlueSkyDB;

  private readonly postCursorKey = "postCursorKey";

  constructor() {
    super({ name: "blue-sky" });

    if (!this.db.has(this.postCursorKey)) {
      this.db.set(this.postCursorKey, "");
    }
  }

  static getInstance(): BlueSkyDB {
    return this.instance || (this.instance = new this());
  }

  setPostCursor(newPostCursor: string): void {
    this.db.set(this.postCursorKey, newPostCursor);
    Stumper.debug(`Setting last post id to: ${newPostCursor}`, "blueSky:BlueSkyDB:setPostCursor");
  }

  getPostCursor(): string {
    return this.db.get(this.postCursorKey);
  }
}
