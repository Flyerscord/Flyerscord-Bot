import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";

export const nhlConfigSchema = [] as const satisfies readonly IModuleConfigSchema[];

export default class NHLModule extends Module {
  protected readonly CONFIG_SCHEMA = nhlConfigSchema;

  constructor() {
    super("NHL");
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
  }

  protected async cleanup(): Promise<void> {}
}
