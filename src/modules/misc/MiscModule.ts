import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";

export default class MiscModule extends Module {
  constructor() {
    super("Misc");
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
  }

  protected async cleanup(): Promise<void> {
    // Nothing to cleanup
  }
}
