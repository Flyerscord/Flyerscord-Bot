import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";

export default class BlueSkyModule extends Module {
  constructor() {
    super("BlueSky");
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
  }
}
