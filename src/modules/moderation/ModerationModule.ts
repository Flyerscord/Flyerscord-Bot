import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";

export const moderationConfigSchema = [] as const satisfies readonly IModuleConfigSchema[];

export default class ModerationModule extends Module {
  protected readonly CONFIG_SCHEMA = moderationConfigSchema;

  constructor() {
    super("Moderation");
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
  }

  protected async cleanup(): Promise<void> {}
}
