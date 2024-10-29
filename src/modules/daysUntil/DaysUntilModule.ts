import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";

export default class DaysUntilModule extends Module {
  constructor() {
    super("DaysUntil");
  }

  protected override setup(): void {
    this.readInCommands<SlashCommand>(__dirname, "slash");
  }
}
