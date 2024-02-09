import Stumper from "stumper";

import { AdminSlashCommand, PARAM_TYPES } from "../../../models/SlashCommand";
import { ChatInputCommandInteraction, User } from "discord.js";
import LevelsDB from "../../../providers/Levels.Database";

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
    const confirmation: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "confirm");
    const user: User = this.getParamValue(interaction, PARAM_TYPES.USER, "user");

    const db = LevelsDB.getInstance();

    if (confirmation == "CONFIRM") {
      Stumper.warning(`Resetting exp for username: ${user.username} id: ${user.id}.  Performed by: ${interaction.user.username}`, "ResetUserCommand");

      db.resetUser(user.id);
    }
  }
}
