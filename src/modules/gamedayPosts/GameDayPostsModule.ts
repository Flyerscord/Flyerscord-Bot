import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";
import CloseAndLockPostsTask from "./tasks/CloseAndLockPostsTask";
import CreateGameDayPostTask from "./tasks/CreateGameDayPostTask";

export default class GameDayPostsModule extends Module {
  constructor() {
    super("GameDayPosts");
  }

  protected override async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerSchedules();
  }

  private registerSchedules(): void {
    // Run every day at 12:30 AM
    new CreateGameDayPostTask().createScheduledJob();

    // Run every day at 4:30 AM
    new CloseAndLockPostsTask().createScheduledJob();
  }
}
