import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";
import PlayerEmojisDB from "./providers/PlayerEmojis.Database";
import EmojiCheckTask from "./tasks/EmojiCheckTask";

export default class PlayerEmojisModule extends Module {
  constructor() {
    super("PlayerEmojis");
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerSchedules();
  }

  protected async cleanup(): Promise<void> {
    PlayerEmojisDB.getInstance().close();
  }

  private registerSchedules(): void {
    new EmojiCheckTask().createScheduledJob();
  }
}
