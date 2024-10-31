/* eslint-disable @typescript-eslint/no-explicit-any */
import Enmap, { EnmapOptions } from "enmap";
import Stumper from "stumper";

export default abstract class Database {
  protected db: Enmap;
  protected name: string;

  constructor(protected options: EnmapOptions<any, any>) {
    this.db = new Enmap(options);
    this.name = options.name || "Database";
  }

  wipe(): void {
    Stumper.info(`Wiping ${this.name} database`, "common:Database:wipe");
    this.db.clear();
  }

  getNumOfKeys(): number {
    return this.db.count;
  }

  protected getAllValues(): any[] {
    const arr = Array.from(this.db);
    return arr.map((val) => val[1]);
  }

  protected getAllKeys(): (string | number)[] {
    return Array.from(this.db.keys());
  }

  protected getAllKeysAndValues(): { key: string | number; value: any }[] {
    const arr = Array.from(this.db);
    return arr.map((val) => {
      return { key: val[0], value: val[1] };
    });
  }

  close(): void {
    Stumper.warning(`Closing database: ${this.name}`, "common:Database:close");
    this.db.close();
  }
}
