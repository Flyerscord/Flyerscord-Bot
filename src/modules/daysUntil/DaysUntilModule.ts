import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import Module from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import onAutocomplete from "./listeners/onAutocomplete";
import DaysUntilDB from "./providers/DaysUtil.Database";

export default class DaysUntilModule extends Module<IDaysUntilConfig> {
  constructor(config: IKeyedObject) {
    super("DaysUntil", config);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerListeners();
  }

  protected async cleanup(): Promise<void> {
    DaysUntilDB.getInstance().close();
  }

  protected getDefaultConfig(): IDaysUntilConfig {
    return {};
  }

  private registerListeners(): void {
    onAutocomplete();
  }
}

export interface IDaysUntilConfig {}
