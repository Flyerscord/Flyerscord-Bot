import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";

export type NHLConfigKeys = "";

export const nHLConfigSchema = [] as const satisfies readonly IModuleConfigSchema<NHLConfigKeys>[];

export default class NHLModule extends Module<NHLConfigKeys> {
  constructor() {
    super("NHL");
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
  }

  protected async cleanup(): Promise<void> {}

  getConfigSchema(): IModuleConfigSchema<NHLConfigKeys>[] {
    return [...nHLConfigSchema];
  }
}
