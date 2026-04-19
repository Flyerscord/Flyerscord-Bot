import Stumper from "stumper";
import { Singleton } from "./Singleton";
import schedule, { Job } from "node-schedule";

export default abstract class EphemeralTask extends Singleton {
  protected name: string;
  protected date: Date | undefined;

  private job: Job | undefined;

  protected constructor(name: string, date?: Date) {
    super();
    this.name = name + "_Ephemeral";
    this.date = date;
  }

  private async run(): Promise<void> {
    Stumper.info(`Running EphemeralTask: ${this.name}`, "common:EphemeralTask:run");
    await this.execute();
    Stumper.info(`Finished EphemeralTask: ${this.name}`, "common:EphemeralTask:run");
    this.removeScheduledJob();
  }

  protected abstract execute(): Promise<void>;

  getName(): string {
    return this.name;
  }

  getDate(): Date | undefined {
    return this.date;
  }

  setDate(date: Date): void {
    this.date = date;
    this.createScheduledJob();
  }

  getTimeUntilExecution(): number {
    if (!this.date) {
      return -1;
    }
    return this.date.getTime() - Date.now();
  }

  isActive(): boolean {
    return !!this.job;
  }

  private createScheduledJob(): void {
    if (!this.job) {
      if (!this.date) {
        Stumper.error(
          `Cannot create scheduled job for EphemeralTask: ${this.name} because date is undefined!`,
          "common:EphemeralTask:createScheduledJob",
        );
        return;
      }
      Stumper.debug(`Creating scheduled job for EphemeralTask: ${this.name} to run at ${this.date}`, "common:EphemeralTask:createScheduledJob");
      this.job = schedule.scheduleJob(this.date, this.run.bind(this));
    } else {
      Stumper.debug(`Scheduled job for EphemeralTask: ${this.name} already exists!`, "common:EphemeralTask:createScheduledJob");
    }
  }

  removeScheduledJob(): void {
    if (this.job) {
      Stumper.debug(`Removing scheduled job for EphemeralTask: ${this.name}`, "common:EphemeralTask:removeScheduledJob");
      this.job.cancel();
      this.job = undefined;
      this.date = undefined;
    }
  }
}
