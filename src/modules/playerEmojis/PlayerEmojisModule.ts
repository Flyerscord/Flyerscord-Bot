import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import EmojiCheckTask from "./tasks/EmojiCheckTask";
import schema from "./db/schema";

export const playerEmojisConfigSchema = [] as const satisfies readonly IModuleConfigSchema[];

export default class PlayerEmojisModule extends Module {
  protected readonly CONFIG_SCHEMA = playerEmojisConfigSchema;

  constructor() {
    super("PlayerEmojis", { schema });
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerSchedules();
  }

  protected async cleanup(): Promise<void> {
    EmojiCheckTask.getInstance().stopScheduledJob();
  }

  private registerSchedules(): void {
    EmojiCheckTask.getInstance().createScheduledJob();
  }
}
