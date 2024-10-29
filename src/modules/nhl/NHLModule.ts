import Module from "../../common/models/Module.js";
import SlashCommand from "../../common/models/SlashCommand.js";

export default class NHLModule extends Module {
  constructor() {
    super("NHL");
  }

  protected override setup(): void {
    this.readInCommands<SlashCommand>("slash");
  }
}
