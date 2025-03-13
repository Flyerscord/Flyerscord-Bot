import { Message } from "discord.js";
import { DMTextCommand } from "../../../../common/models/TextCommand";
import { readAndRegisterCommands } from "../../utils/registerCommands";
import discord from "../../../../common/utils/discord/discord";
import CommonModule from "../../../../common/CommonModule";

export default class ReloadSlashCommandsCommand extends DMTextCommand {
  constructor() {
    super(CommonModule.getInstance().config.adminPrefix, "Reload Slash Commands", "reloadslashcommands", { allowedUsers: ["140656762960347136"] });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(message: Message, args: string[]): Promise<void> {
    await readAndRegisterCommands();
    discord.messages.sendMesssageDMToUser(message.author.id, "Successfully reloaded slash commands!");
  }
}
