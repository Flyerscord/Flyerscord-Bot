import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import Module from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import PlayerEmojisDB from "./providers/PlayerEmojis.Database";
import EmojiCheckTask from "./tasks/EmojiCheckTask";

export default class PlayerEmojisModule extends Module<IPlayerEmojisConfig> {
  constructor(config: IKeyedObject) {
    super("PlayerEmojis", config);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerSchedules();
  }

  protected async cleanup(): Promise<void> {
    PlayerEmojisDB.getInstance().close();
  }

  protected getDefaultConfig(): IPlayerEmojisConfig {
    return {};
  }

  private registerSchedules(): void {
    EmojiCheckTask.getInstance().createScheduledJob();
  }
}

export interface IPlayerEmojisConfig {}
