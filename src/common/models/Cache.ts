import Stumper from "stumper";
import Task from "./Task";

export default abstract class Cache<T> extends Task {
  protected cache: T;

  protected constructor(name: string, cron: string, intialCache: T) {
    super(name, cron);
    this.cache = intialCache;
  }

  protected abstract updateCache(): Promise<void>;

  protected async execute(): Promise<void> {
    Stumper.info(`Updating cache: ${this.name}`, "common:Cache:execute");
    await this.updateCache();
    Stumper.info(`Cache updated: ${this.name}`, "common:Cache:execute");
  }

  getCache(): T {
    return this.cache;
  }

  async forceUpdate(): Promise<void> {
    Stumper.info(`Forcing update of cache: ${this.name}`, "common:Cache:forceUpdate");
    await this.updateCache();
    Stumper.info(`Cache updated: ${this.name}`, "common:Cache:forceUpdate");
  }
}
