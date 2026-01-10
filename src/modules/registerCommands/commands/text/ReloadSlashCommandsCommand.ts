import { Message } from "discord.js";
import { DMTextCommand } from "@common/models/TextCommand";
import { readAndRegisterCommands } from "../../utils/registerCommands";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@root/src/common/managers/ConfigManager";

export default class ReloadSlashCommandsCommand extends DMTextCommand {
  constructor() {
    super(ConfigManager.getInstance().getConfig("Common").adminPrefix, "Reload Slash Commands", "reloadslashcommands", {
      allowedUsers: ["140656762960347136"],
    });
  }

  async execute(message: Message, _args: string[]): Promise<void> {
    await readAndRegisterCommands();
    await discord.messages.sendMesssageDMToUser(message.author.id, "Successfully reloaded slash commands!");
  }
}
