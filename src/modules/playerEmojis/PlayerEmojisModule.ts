import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";
import EmojiCheckTask from "./tasks/EmojiCheckTask";

export default class PlayerEmojisModule extends Module {
  constructor() {
    super("PlayerEmojis");
  }

  protected override async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerSchedules();
  }

  private registerSchedules(): void {
    new EmojiCheckTask().createScheduledJob();
  }
}
