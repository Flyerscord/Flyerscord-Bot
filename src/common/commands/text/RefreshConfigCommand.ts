import { Message } from "discord.js";
import ConfigManager from "../../managers/ConfigManager";
import MyAuditLog from "../../utils/AuditLog";
import { DMTextCommand } from "../../models/TextCommand";
import discord from "../../utils/discord/discord";

export default class RefreshConfigCommand extends DMTextCommand {
  constructor() {
    super(ConfigManager.getInstance().getConfig("Common").adminPrefix, "Refresh Config", "refreshconfig", {
      allowedUsers: ["140656762960347136"],
    });
  }

  async execute(message: Message, _args: string[]): Promise<void> {
    const configManager = ConfigManager.getInstance();
    await MyAuditLog.createAuditLog("Common", {
      action: "RefreshConfig",
      userId: message.author.id,
    });

    const result = await configManager.refreshConfig();

    await discord.messages.sendMesssageDMToUser(
      message.author.id,
      `Refreshed config successfully! ${result.success ? "✅" : "❌"} ${result.keysChanged.length} keys changed, ${result.keysRequireRestart.length} keys require restart`,
    );
  }
}
