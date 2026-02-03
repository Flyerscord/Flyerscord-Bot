import { AdminSlashCommand } from "@common/models/SlashCommand";
import { ChatInputCommandInteraction, userMention } from "discord.js";
import ModerationDB from "../../db/ModerationDB";
import { WarningType } from "../../db/schema";

export default class AddWarningCommand extends AdminSlashCommand {
  constructor() {
    super("addwarning", "Add a warning to a user");

    this.data
      .addUserOption((option) => option.setName("user").setDescription("The user to add a note to").setRequired(true))
      .addStringOption((option) => option.setName("warning").setDescription("The warning to add").setRequired(true));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = this.getUserParamValue(interaction, "user");
    const warning = this.getStringParamValue(interaction, "warning");

    const db = new ModerationDB();

    await db.addWarning(user.id, warning, WarningType.USER, interaction.user.id);

    const warnings = await db.getWarnings(user.id);
    const numWarnings = warnings.length;

    await interaction.reply(`Warning #${numWarnings} added for user ${userMention(user.id)}`);
  }
}
