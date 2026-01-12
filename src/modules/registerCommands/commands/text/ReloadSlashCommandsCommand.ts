import { Message } from "discord.js";
import { DMTextCommand } from "@common/models/TextCommand";
import { readAndRegisterCommands } from "../../utils/registerCommands";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/managers/ConfigManager";
import MyAuditLog from "@common/utils/MyAuditLog";
import { AuditLogSeverity } from "@common/db/schema";

export default class ReloadSlashCommandsCommand extends DMTextCommand {
  constructor() {
    super(ConfigManager.getInstance().getConfig("Common").adminPrefix, "Reload Slash Commands", "reloadslashcommands", {
      allowedUsers: ["140656762960347136"],
    });
  }

  async execute(message: Message, _args: string[]): Promise<void> {
    await readAndRegisterCommands();

    await MyAuditLog.createAuditLog("RegisterCommands", {
      action: "ReloadSlashCommands",
      userId: message.author.id,
      severity: AuditLogSeverity.WARNING,
    });
    await discord.messages.sendMesssageDMToUser(message.author.id, "Successfully reloaded slash commands!");
  }
}
