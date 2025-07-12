import { ChatInputCommandInteraction, User } from "discord.js";
import Stumper from "stumper";
import { AdminSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import LevelsDB from "../../providers/Levels.Database";
import discord from "@common/utils/discord/discord";

export default class ResetUserCommand extends AdminSlashCommand {
  constructor() {
    super("resetuserexp", "Resets exp for a given user");

    this.data
      .addStringOption((option) =>
        option
          .setName("confirm")
          .setDescription("Confirm this is actually something that you want to do. The value must be CONFIRM.")
          .setRequired(true),
      )
      .addUserOption((option) => option.setName("user").setDescription("The user to reset to exp of.").setRequired(true));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const replies = await discord.interactions.createReplies(interaction, "levels:ResetUserCommand:execute", true);

    const confirmation: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "confirm");
    const user: User = this.getParamValue(interaction, PARAM_TYPES.USER, "user");

    const db = LevelsDB.getInstance();

    if (confirmation == "CONFIRM") {
      Stumper.warning(
        `Resetting exp for username: ${user.username} id: ${user.id}.  Performed by: ${interaction.user.username}`,
        "levels:ResetUserCommand:execute",
      );

      db.resetUser(user.id);
      await replies.reply(`Resetting exp for username: ${user.username} id: ${user.id}`);
      return;
    }

    await replies.reply("Error resetting user!");
  }
}
