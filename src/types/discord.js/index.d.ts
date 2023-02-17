import SlashCommand from "../../models/SlashCommand";
import TextCommand from "../../models/TextCommand";

export {};

declare module "discord.js" {
  export interface Client {
      slashCommands: Collection<string, SlashCommand>;
      textCommands: Collection<string, TextCommand>;
  }
}
