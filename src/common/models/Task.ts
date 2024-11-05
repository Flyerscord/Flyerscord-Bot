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

  private async run(): Promise<void> {
    Stumper.info(`Running task: ${this.name}`, "common:Task:run");
    await this.execute();
    Stumper.info(`Task ${this.name} completed!`, "common:Task:run");
  }

  protected abstract execute(): Promise<void>;

  getName(): string {
    return this.name;
  }

  getInterval(): string {
    return this.interval;
  }

  createScheduledJob(): void {
    Stumper.debug(`Creating scheduled job: ${this.name}`, "common:Task:createScheduledJob");
    this.job = schedule.scheduleJob(this.interval, this.run.bind(this));
  }

  stopScheduledJob(): void {
    if (this.job) {
      Stumper.debug(`Stopping scheduled job: ${this.name}`, "common:Task:stopScheduledJob");
      this.job.cancel();
    }
  }
}
