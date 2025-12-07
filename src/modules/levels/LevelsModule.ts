import Module from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import onMessageCreate from "./listeners/onMessageCreate";
import { calculateLevels } from "./utils/requiredExp";
import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import schema from "./db/schema";

export default class LevelsModule extends Module<ILevelsConfig> {
  constructor(config: IKeyedObject) {
    super("Levels", config, schema);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerListeners();

    calculateLevels(1000);
  }

  protected async cleanup(): Promise<void> {}

  protected getDefaultConfig(): ILevelsConfig {
    return {};
  }

  private registerListeners(): void {
    onMessageCreate();
  }
}

export interface ILevelsConfig {}
