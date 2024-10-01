import Module from "../../common/models/Module";
import schedule from "node-schedule";
import { checkForGameDay, closeAndLockOldPosts } from "./utils/GameChecker";

export default class GameDayPostsModule extends Module {
  constructor() {
    super("GameDayPosts");
  }

  protected override setup(): void {
    this.registerSchedules();
  }

  private registerSchedules(): void {
    // Run every day at midnight
    schedule.scheduleJob("0 0 0 * * *", async () => {
      await checkForGameDay();
      await closeAndLockOldPosts();
    });
  }
}
