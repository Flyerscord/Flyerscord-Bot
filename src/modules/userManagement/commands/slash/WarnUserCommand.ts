import { ChatInputCommandInteraction, User } from "discord.js";
import Stumper from "stumper";
import { AdminSlashCommand, PARAM_TYPES } from "../../../../common/models/SlashCommand";
import UserManagementDB from "../../providers/UserManagement.Database";
import { sendLogMessage } from "../../utils/ChannelLogging";

export default class WarnUserCommand extends AdminSlashCommand {
  constructor() {
    super("userwarn", "Add a warning to a user");

    this.data
      .addUserOption((option) => option.setName("user").setDescription("The user to add the warning to").setRequired(true))
      .addStringOption((option) => option.setName("reason").setDescription("The reason for the warning").setRequired(true));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user: User = this.getParamValue(interaction, PARAM_TYPES.USER, "user");
    const reason: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "reason");

    const db = UserManagementDB.getInstance();
    db.addWarning(user.id, reason);

    Stumper.info(`Added warning for user: ${user.username} by user ${interaction.user.username}`, "WarnUserCommand");
    sendLogMessage(`Added warning for user: ${user.username} by user ${interaction.user.username} Reason: ${reason}`);
    interaction.reply(`Added warning for user: ${user.username}!`);
  }
}
