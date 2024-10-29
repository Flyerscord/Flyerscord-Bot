import Module from "../../common/models/Module.js";
import SlashCommand from "../../common/models/SlashCommand.js";

export default class DaysUntilModule extends Module {
  constructor() {
    super("DaysUntil");
  }

  protected override setup(): void {
    this.readInCommands<SlashCommand>("slash");
  }
}
