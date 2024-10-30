import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";
import onAutocomplete from "./listeners/onAutocomplete";

export default class DaysUntilModule extends Module {
  constructor() {
    super("DaysUntil");
  }

  protected override async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerListeners();
  }

  private registerListeners(): void {
    onAutocomplete();
  }
}
