import ModalMenu from "../../models/ModalMenu";
import SlashCommand from "../../models/SlashCommand";
import TextCommand from "../../models/TextCommand";
import { ContextMenuCommand } from "../../models/ContextMenuCommand";

export { };

declare module "discord.js" {
    export interface Client {
        slashCommands: Collection<string, SlashCommand>;
        textCommands: Collection<string, TextCommand>;
        modals: Collection<string, ModalMenu>;
        contextMenus: Collection<string, ContextMenuCommand>;
    }
}
