import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";
import GameDayPostsDB from "./providers/GameDayPosts.Database";
import CloseAndLockPostsTask from "./tasks/CloseAndLockPostsTask";
import CreateGameDayPostTask from "./tasks/CreateGameDayPostTask";

export default class GameDayPostsModule extends Module {
  constructor() {
    super("GameDayPosts");
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerSchedules();
  }

  protected async cleanup(): Promise<void> {
    GameDayPostsDB.getInstance().close();
  }

  private registerSchedules(): void {
    // Run every day at 12:30 AM
    new CreateGameDayPostTask().createScheduledJob();

    // Run every day at 4:30 AM
    new CloseAndLockPostsTask().createScheduledJob();
  }
}
