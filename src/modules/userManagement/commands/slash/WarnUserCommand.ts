import { ChatInputCommandInteraction, User } from "discord.js";
import Stumper from "stumper";
import { AdminSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
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
    await interaction.deferReply({ ephemeral: true });

    const user: User = this.getParamValue(interaction, PARAM_TYPES.USER, "user");
    const reason: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "reason");

    const db = UserManagementDB.getInstance();
    db.addWarning(user.id, reason, interaction.user.id);

    Stumper.info(`Added warning for user: ${user.username} by user ${interaction.user.username}`, "userManagement:WarnUserCommand:execute");
    sendLogMessage(`Added warning for user: \`${user.username}\` by user \`${interaction.user.username}\` Reason: \`${reason}\``);
    interaction.editReply(`Added warning for user: ${user.username}!`);
  }
}
