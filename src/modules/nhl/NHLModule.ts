import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import Module from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";

export default class NHLModule extends Module<INHLConfig> {
  constructor(config: IKeyedObject) {
    super("NHL", config);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
  }

  protected async cleanup(): Promise<void> {
    // Nothing to cleanup
  }

  protected getDefaultConfig(): INHLConfig {
    return {};
  }
}

export interface INHLConfig {}
