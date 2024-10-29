import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";

export default class UserManagementModule extends Module {
  constructor() {
    super("UserManagement");
  }

  protected override setup(): void {
    this.readInCommands<SlashCommand>(__dirname, "slash");
  }
}
