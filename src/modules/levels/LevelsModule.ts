import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import onMessageCreate from "./listeners/onMessageCreate";
import { calculateLevels } from "./utils/requiredExp";
import schema from "./db/schema";

export const levelsConfigSchema = [] as const satisfies readonly IModuleConfigSchema[];

export default class LevelsModule extends Module {
  protected readonly CONFIG_SCHEMA = levelsConfigSchema;

  constructor() {
    super("Levels", { schema });
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerListeners();

    await calculateLevels(1000);
  }

  protected async cleanup(): Promise<void> {}

  private registerListeners(): void {
    onMessageCreate();
  }
}
