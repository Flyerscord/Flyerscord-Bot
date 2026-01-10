import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";

export type NHLConfigKeys = "";

export default class NHLModule extends Module<NHLConfigKeys> {
  constructor(config: IKeyedObject) {
    super("NHL", config);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
  }

  protected async cleanup(): Promise<void> {}

  protected getConfigSchema(): IModuleConfigSchema<NHLConfigKeys>[] {
    return [];
  }
}
