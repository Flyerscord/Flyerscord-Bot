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
    Logger.info(`Wiping database: ${this.name}`, "Database");
    this.db.clear();
  }

  getNumOfKeys(): number {
    return this.db.count;
  }

  protected getAllValues(): Array<any> {
    const arr = Array.from(this.db);
    return arr.map((val) => val[1]);
  }

  protected getAllKeys(): Array<string | number> {
    return Array.from(this.db.keys());
  }

  protected getAllKeysAndValues(): Array<IItem> {
    const arr = Array.from(this.db);
    return arr.map((val) => {
      return { key: val[0], value: val[1] };
    });
  }
}

export interface IItem {
  key: string | number;
  value: any;
}
