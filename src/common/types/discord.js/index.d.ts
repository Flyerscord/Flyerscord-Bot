import ModalMenu from "../../models/ModalMenu.js";
import SlashCommand from "../../models/SlashCommand.js";
import TextCommand from "../../models/TextCommand.js";
import { ContextMenuCommand } from "../../models/ContextMenuCommand.js";

export {};

declare module "discord.js" {
  export interface Client {
    slashCommands: Collection<string, SlashCommand>;
    textCommands: Collection<string, TextCommand>;
    modals: Collection<string, ModalMenu>;
    contextMenus: Collection<string, ContextMenuCommand>;
  }
}
