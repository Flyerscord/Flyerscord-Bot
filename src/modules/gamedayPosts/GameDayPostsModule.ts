import Module from "../../common/models/Module.js";
import CreateGameDayPostTask from "./tasks/CreateGameDayPostTask.js";

export default class GameDayPostsModule extends Module {
  constructor() {
    super("GameDayPosts");
  }

  protected override setup(): void {
    this.registerSchedules();
  }

  private registerSchedules(): void {
    // Run every day at midnight
    new CreateGameDayPostTask().createScheduledJob();
  }
}
