import { Message } from "discord.js";
import { DMTextCommand } from "../../../../common/models/TextCommand";
import { readAndRegisterCommands } from "../../utils/registerCommands";
import discord from "../../../../common/utils/discord/discord";
import ConfigManager from "@common/config/ConfigManager";

export default class ReloadSlashCommandsCommand extends DMTextCommand {
  constructor() {
    super(ConfigManager.getInstance().getConfig("Common").adminPrefix, "Reload Slash Commands", "reloadslashcommands", {
      allowedUsers: ["140656762960347136"],
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(message: Message, args: string[]): Promise<void> {
    await readAndRegisterCommands();
    discord.messages.sendMesssageDMToUser(message.author.id, "Successfully reloaded slash commands!");
  }
}
