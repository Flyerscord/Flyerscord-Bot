import ContextMenuCommand from "@common/models/ContextMenuCommand";
import Module, { IModuleConfigSchema } from "@common/models/Module";
import ModalMenu from "@common/models/ModalMenu";
import SlashCommand from "@common/models/SlashCommand";
import ButtonHandler from "@common/models/ButtonHandler";
import Zod from "@common/utils/ZodWrapper";
import schema from "./db/schema";
import onGuildBanAdd from "./listeners/onGuildBanAdd";
import onGuildBanRemove from "./listeners/onGuildBanRemove";
import onGuildMemberRemove from "./listeners/onGuildMemberRemove";

export const userManagementConfigSchema = [
  {
    key: "notificationChannelId",
    description: "The channel ID to post warning and note notifications to",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
] as const satisfies readonly IModuleConfigSchema[];

export default class UserManagementModule extends Module {
  protected readonly CONFIG_SCHEMA = userManagementConfigSchema;

  constructor() {
    super("UserManagement", { schema });
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
    await this.readInCommands<ContextMenuCommand>(__dirname, "context");
    await this.readInCommands<ModalMenu>(__dirname, "modal");
    await this.readInCommands<ButtonHandler>(__dirname, "buttons");

    this.registerListeners();
  }

  protected async cleanup(): Promise<void> {}

  private registerListeners(): void {
    onGuildBanAdd();
    onGuildBanRemove();
    onGuildMemberRemove();
  }
}
