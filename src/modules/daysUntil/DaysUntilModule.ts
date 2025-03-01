import { IDefaultConfig } from "../../common/interfaces/IDefaultConfig";
import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";
import onAutocomplete from "./listeners/onAutocomplete";
import DaysUntilDB from "./providers/DaysUtil.Database";

export default class DaysUntilModule extends Module {
  constructor() {
    super("DaysUntil");
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerListeners();
  }

  protected async cleanup(): Promise<void> {
    DaysUntilDB.getInstance().close();
  }

  protected getDefaultConfig<T>(): T {
    return {};
  }

  private registerListeners(): void {
    onAutocomplete();
  }
}
