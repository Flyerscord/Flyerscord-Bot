import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import EmojiCheckTask from "./tasks/EmojiCheckTask";
import schema from "./db/schema";

export type PlayerEmojisConfigKeys = "";

export const playerEmojisConfigSchema = [] as const satisfies readonly IModuleConfigSchema<PlayerEmojisConfigKeys>[];

export default class PlayerEmojisModule extends Module<PlayerEmojisConfigKeys> {
  constructor() {
    super("PlayerEmojis", schema);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerSchedules();
  }

  protected async cleanup(): Promise<void> {}

  getConfigSchema(): IModuleConfigSchema<PlayerEmojisConfigKeys>[] {
    return [...playerEmojisConfigSchema];
  }

  private registerSchedules(): void {
    EmojiCheckTask.getInstance().createScheduledJob();
  }
}
