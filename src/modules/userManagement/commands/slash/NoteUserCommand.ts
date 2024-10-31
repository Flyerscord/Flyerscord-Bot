import { ChatInputCommandInteraction, User } from "discord.js";
import Stumper from "stumper";
import { AdminSlashCommand, PARAM_TYPES } from "../../../../common/models/SlashCommand";
import UserManagementDB from "../../providers/UserManagement.Database";
import { sendLogMessage } from "../../utils/ChannelLogging";

export default class NoteUserCommand extends AdminSlashCommand {
  constructor() {
    super("usernote", "Add a note to a user");

    this.data
      .addUserOption((option) => option.setName("user").setDescription("The user to add the note to").setRequired(true))
      .addStringOption((option) => option.setName("note").setDescription("The note to be added to the user").setRequired(true));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user: User = this.getParamValue(interaction, PARAM_TYPES.USER, "user");
    const note: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "note");

    const db = UserManagementDB.getInstance();
    db.addNote(user.id, note, interaction.user.id);

    Stumper.info(`Added note for user: ${user.username} by user ${interaction.user.username}`, "userManagement:NoteUserCommand:execute");
    sendLogMessage(`Added note for user: \`${user.username}\` by user \`${interaction.user.username}\` Note: \`${note}\``);
    interaction.reply(`Added note for user: ${user.username}!`);
  }
}
