import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import onMessageCreate from "./listeners/onMessageCreate";
import { calculateLevels } from "./utils/requiredExp";
import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import schema from "./db/schema";

export type LevelsConfigKeys = "";

export default class LevelsModule extends Module<LevelsConfigKeys> {
  constructor(config: IKeyedObject) {
    super("Levels", config, schema);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerListeners();

    await calculateLevels(1000);
  }

  protected async cleanup(): Promise<void> {}

  protected getConfigSchema(): IModuleConfigSchema<LevelsConfigKeys>[] {
    return [];
  }

  private registerListeners(): void {
    onMessageCreate();
  }
}
