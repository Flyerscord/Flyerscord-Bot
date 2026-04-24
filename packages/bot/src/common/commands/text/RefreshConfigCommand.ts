import { Message } from "discord.js";
import ConfigManager from "../../managers/ConfigManager";
import MyAuditLog from "../../utils/MyAuditLog";
import { BotManagerDMTextCommand } from "../../models/TextCommand";
import discord from "../../utils/discord/discord";
import { AuditLogSeverity } from "../../db/schema";

export default class RefreshConfigCommand extends BotManagerDMTextCommand {
  constructor() {
    super(ConfigManager.getInstance().getConfig("Common").adminPrefix, "Refresh Config", "refreshconfig");
  }

  async execute(message: Message, _args: string[]): Promise<void> {
    const configManager = ConfigManager.getInstance();

    const result = await configManager.refreshConfig();

    await MyAuditLog.createAuditLog("Common", {
      action: "RefreshConfig",
      userId: message.author.id,
      severity: AuditLogSeverity.WARNING,
      details: { result },
    });

    await discord.messages.sendMessageDMToUser(
      message.author.id,
      `Refreshed config successfully! ${result.success ? "✅" : "❌"} ${result.keysChanged.length} keys changed, ${result.keysRequireRestart.length} keys require restart`,
    );
  }
}
