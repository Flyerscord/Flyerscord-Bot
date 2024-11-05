import ContextMenuCommand from "../../common/models/ContextMenuCommand";
import ModalMenu from "../../common/models/ModalMenu";
import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";

export default class UserManagementModule extends Module {
  constructor() {
    super("UserManagement");
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
    await this.readInCommands<ContextMenuCommand>(__dirname, "context");
    await this.readInCommands<ModalMenu>(__dirname, "modal");
  }
}
