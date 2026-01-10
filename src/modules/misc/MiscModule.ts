import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";

export type MiscConfigKeys = "";

export const miscConfigSchema = [] as const satisfies readonly IModuleConfigSchema<MiscConfigKeys>[];

export default class MiscModule extends Module<MiscConfigKeys> {
  constructor(config: IKeyedObject) {
    super("Misc", config);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
  }

  protected async cleanup(): Promise<void> {}

  getConfigSchema(): IModuleConfigSchema<MiscConfigKeys>[] {
    return [...miscConfigSchema];
  }
}
