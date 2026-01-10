import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import EmojiCheckTask from "./tasks/EmojiCheckTask";
import schema from "./db/schema";

export type PlayerEmojisConfigKeys = "";

export default class PlayerEmojisModule extends Module<PlayerEmojisConfigKeys> {
  constructor(config: IKeyedObject) {
    super("PlayerEmojis", config, schema);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerSchedules();
  }

  protected async cleanup(): Promise<void> {}

  protected getConfigSchema(): IModuleConfigSchema<PlayerEmojisConfigKeys>[] {
    return [];
  }

  private registerSchedules(): void {
    EmojiCheckTask.getInstance().createScheduledJob();
  }
}
