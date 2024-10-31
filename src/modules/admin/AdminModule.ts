import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";

export default class AdminModule extends Module {
  constructor() {
    super("Admin");
  }

  protected override async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
  }
}
