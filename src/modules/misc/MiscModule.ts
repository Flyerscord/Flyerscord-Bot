import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";

export type MiscConfigKeys = "";

export default class MiscModule extends Module<MiscConfigKeys> {
  constructor(config: IKeyedObject) {
    super("Misc", config);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
  }

  protected async cleanup(): Promise<void> {}

  protected getConfigSchema(): IModuleConfigSchema<MiscConfigKeys>[] {
    return [];
  }
}
