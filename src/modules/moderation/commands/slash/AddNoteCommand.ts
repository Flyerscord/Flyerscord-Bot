import { AdminSlashCommand } from "@common/models/SlashCommand";
import { ChatInputCommandInteraction, userMention } from "discord.js";
import ModerationDB from "../../db/ModerationDB";

export default class AddNoteCommand extends AdminSlashCommand {
  constructor() {
    super("addnote", "Add a note to a user");

    this.data
      .addUserOption((option) => option.setName("user").setDescription("The user to add a note to").setRequired(true))
      .addStringOption((option) => option.setName("note").setDescription("The note to add").setRequired(true));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = this.getUserParamValue(interaction, "user");
    const note = this.getStringParamValue(interaction, "note");

    const db = new ModerationDB();

    await db.addNote(user.id, note, interaction.user.id);

    const notes = await db.getNotes(user.id);
    const numNotes = notes.length;

    await interaction.reply(`Note #${numNotes} added for user ${userMention(user.id)}`);
  }
}
