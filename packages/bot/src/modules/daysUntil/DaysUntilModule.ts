import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import schema from "./db/schema";

export const daysUntilConfigSchema = [] as const satisfies readonly IModuleConfigSchema[];

export default class DaysUntilModule extends Module {
  protected readonly CONFIG_SCHEMA = daysUntilConfigSchema;

  constructor() {
    super("DaysUntil", { schema });
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
  }

  protected async cleanup(): Promise<void> {}
}
