import Enmap, { EnmapOptions } from "enmap";

import Logger from "stumper";

export default abstract class Database {
  protected db: Enmap;
  protected name: string;

  constructor(protected options: EnmapOptions<any, any>) {
    this.db = new Enmap(options);
    this.name = options.name || "Database";
  }

  wipe(): void {
    Logger.info(`Wiping database`, this.name);
    this.db.clear();
  }

  protected getAllValues(): Array<any> {
    const arr = Array.from(this.db);
    return arr.map((val) => val[1]);
  }
}
