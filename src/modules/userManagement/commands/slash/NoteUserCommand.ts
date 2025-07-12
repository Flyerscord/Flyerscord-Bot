import { ChatInputCommandInteraction, User } from "discord.js";
import Stumper from "stumper";
import { AdminSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import UserManagementDB from "../../providers/UserManagement.Database";
import { sendLogMessage } from "../../utils/ChannelLogging";
import discord from "@common/utils/discord/discord";

export default class NoteUserCommand extends AdminSlashCommand {
  constructor() {
    super("usernote", "Add a note to a user");

    this.data
      .addUserOption((option) => option.setName("user").setDescription("The user to add the note to").setRequired(true))
      .addStringOption((option) => option.setName("note").setDescription("The note to be added to the user").setRequired(true));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const replies = await discord.interactions.createReplies(interaction, "userManagement:NoteUserCommand:execute", true);

    const user: User = this.getParamValue(interaction, PARAM_TYPES.USER, "user");
    const note: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "note");

    const db = UserManagementDB.getInstance();
    db.addNote(user.id, note, interaction.user.id);

    Stumper.info(`Added note for user: ${user.username} by user ${interaction.user.username}`, "userManagement:NoteUserCommand:execute");
    sendLogMessage(`Added note for user: \`${user.username}\` by user \`${interaction.user.username}\` Note: \`${note}\``);
    await replies.reply(`Added note for user: ${user.username}!`);
  }
}
