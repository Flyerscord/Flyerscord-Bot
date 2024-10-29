import Module from "../../common/models/Module.js";
import SlashCommand from "../../common/models/SlashCommand.js";

export default class MiscModule extends Module {
  constructor() {
    super("Misc");
  }

  protected override setup(): void {
    this.readInCommands<SlashCommand>("slash");
  }
}
