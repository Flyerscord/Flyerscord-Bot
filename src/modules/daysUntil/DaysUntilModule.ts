import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import Module from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import schema from "./db/schema";

export default class DaysUntilModule extends Module<IDaysUntilConfig> {
  constructor(config: IKeyedObject) {
    super("DaysUntil", config, schema);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
  }

  protected async cleanup(): Promise<void> {}

  protected getDefaultConfig(): IDaysUntilConfig {
    return {};
  }
}

export interface IDaysUntilConfig {}
