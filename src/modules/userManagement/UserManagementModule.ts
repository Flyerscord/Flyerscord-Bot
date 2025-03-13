import { IKeyedObject } from "../../common/interfaces/IKeyedObject";
import ContextMenuCommand from "../../common/models/ContextMenuCommand";
import ModalMenu from "../../common/models/ModalMenu";
import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";
import UserManagementDB from "./providers/UserManagement.Database";

export default class UserManagementModule extends Module<IUserManagementConfig> {
  constructor(config: IKeyedObject) {
    super("UserManagement", config);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
    await this.readInCommands<ContextMenuCommand>(__dirname, "context");
    await this.readInCommands<ModalMenu>(__dirname, "modal");
  }

  protected async cleanup(): Promise<void> {
    UserManagementDB.getInstance().close();
  }

  protected getDefaultConfig(): IUserManagementConfig {
    return {
      channelId: "",
    };
  }
}

export interface IUserManagementConfig {
  channelId: string;
}
