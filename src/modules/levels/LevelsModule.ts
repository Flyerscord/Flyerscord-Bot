import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import onMessageCreate from "./listeners/onMessageCreate";
import { calculateLevels } from "./utils/requiredExp";
import schema from "./db/schema";

export type LevelsConfigKeys = "";

export const levelsConfigSchema = [] as const satisfies readonly IModuleConfigSchema<LevelsConfigKeys>[];

export default class LevelsModule extends Module<LevelsConfigKeys> {
  constructor() {
    super("Levels", { schema });
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerListeners();

    await calculateLevels(1000);
  }

  protected async cleanup(): Promise<void> {}

  getConfigSchema(): IModuleConfigSchema<LevelsConfigKeys>[] {
    return [...levelsConfigSchema];
  }

  private registerListeners(): void {
    onMessageCreate();
  }
}
