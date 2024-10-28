import schedule, { Job } from "node-schedule";
import Stumper from "stumper";

export default abstract class Task {
  protected name: string;
  protected interval: string;

  private job: Job | undefined;

  constructor(name: string, interval: string) {
    this.name = name;
    this.interval = interval;
  }

  protected abstract execute(): Promise<void>;

  public getName(): string {
    return this.name;
  }

  public getInterval(): string {
    return this.interval;
  }

  public createScheduledJob(): void {
    Stumper.debug(`Creating scheduled job: ${this.name}`, "createScheduledJob");
    this.job = schedule.scheduleJob(this.interval, this.execute);
  }

  public stopScheduledJob(): void {
    if (this.job) {
      Stumper.debug(`Stopping scheduled job: ${this.name}`, "stopScheduledJob");
      this.job.cancel();
    }
  }
}
