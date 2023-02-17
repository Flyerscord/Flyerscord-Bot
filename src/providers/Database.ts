import Enmap, { EnmapOptions } from "enmap";

import Logger from "../util/Logger";

export default abstract class Database {
  protected db: Enmap;
  protected name: string;

  constructor(protected options: EnmapOptions) {
    this.db = new Enmap(options);
    this.name = options.name || "Database";
  }

  // Add methods below that will be shared across all databases
  wipe(): void {
    Logger.info(`Wiping database`, this.options.name);
    this.db.clear();
  }
}
