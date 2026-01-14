import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";

export const miscConfigSchema = [] as const satisfies readonly IModuleConfigSchema[];

export default class MiscModule extends Module {
  protected readonly CONFIG_SCHEMA = miscConfigSchema;

  constructor() {
    super("Misc");
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
  }

  protected async cleanup(): Promise<void> {}
}
