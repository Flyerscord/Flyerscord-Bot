import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";
import CreateGameDayPostTask from "./tasks/CreateGameDayPostTask";

export default class GameDayPostsModule extends Module {
  constructor() {
    super("GameDayPosts");
  }

  protected override async setup(): Promise<void> {
    this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerSchedules();
  }

  private registerSchedules(): void {
    // Run every day at midnight
    new CreateGameDayPostTask().createScheduledJob();
  }
}
