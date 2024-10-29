import Module from "../../common/models/Module.js";
import SlashCommand from "../../common/models/SlashCommand.js";

export default class UserManagementModule extends Module {
  constructor() {
    super("UserManagement");
  }

  protected override setup(): void {
    this.readInCommands<SlashCommand>("slash");
  }
}
