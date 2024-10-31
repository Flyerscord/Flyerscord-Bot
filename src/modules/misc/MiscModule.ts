import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";

export default class MiscModule extends Module {
  constructor() {
    super("Misc");
  }

  protected override async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
  }
}
