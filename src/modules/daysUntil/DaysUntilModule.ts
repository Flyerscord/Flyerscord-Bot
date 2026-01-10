import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import schema from "./db/schema";

export type DaysUntilConfigKeys = "";

export const daysUntilConfigSchema = [] as const satisfies readonly IModuleConfigSchema<DaysUntilConfigKeys>[];

export default class DaysUntilModule extends Module<DaysUntilConfigKeys> {
  constructor() {
    super("DaysUntil", schema);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
  }

  protected async cleanup(): Promise<void> {}

  getConfigSchema(): IModuleConfigSchema<DaysUntilConfigKeys>[] {
    return [...daysUntilConfigSchema];
  }
}
