import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";

export default class NHLAPIModule extends Module {
  constructor() {
    super("NHLAPI");
  }

  protected override setup(): void {
    this.readInCommands<SlashCommand>("slash");
  }
}
