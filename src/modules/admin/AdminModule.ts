import Module from "../../common/models/Module.js";
import SlashCommand from "../../common/models/SlashCommand.js";

export default class AdminModule extends Module {
  constructor() {
    super("Admin");
  }

  protected override setup(): void {
    this.readInCommands<SlashCommand>("slash");
  }
}
