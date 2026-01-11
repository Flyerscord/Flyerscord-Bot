import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand, PARAM_TYPES } from "../../models/SlashCommand";
import ConfigManager from "../../managers/ConfigManager";
import MyAuditLog from "../../utils/AuditLog";

export default class RefreshConfigCommand extends AdminSlashCommand {
  constructor() {
    super("refresh-config", "Refresh the Bot configuration from the database");

    this.data.addStringOption((option) => option.setName("confirm").setDescription("Enter CONFIRM to confirm this action").setRequired(true));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const confirm = this.getParamValue(interaction, PARAM_TYPES.STRING, "confirm");
    if (confirm !== "CONFIRM") {
      await this.replies.reply({ content: "Invalid confirmation!", ephemeral: true });
      return;
    }

    const configManager = ConfigManager.getInstance();
    await MyAuditLog.createAuditLog("Common", {
      action: "RefreshConfig",
      userId: interaction.user.id,
    });

    const result = await configManager.refreshConfig();
    await this.replies.reply({
      content: `Refreshed config successfully! ${result.success ? "✅" : "❌"} ${result.keysChanged.length} keys changed, ${result.keysRequireRestart.length} keys require restart`,
      ephemeral: true,
    });
  }
}
