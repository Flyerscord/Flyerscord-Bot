import { ChatInputCommandInteraction, User } from "discord.js";

import { PARAM_TYPES, SlashCommand } from "../../../models/SlashCommand";
import UserLevelsDB from "../../../providers/UserLevels.Database";

export default class PingCommand extends SlashCommand {
  constructor() {
    super("rank", "Check the rank of a user");

    this.data.addUserOption((option) =>
      option.setName("user").setDescription("The user to check the rank of. Default: You").setRequired(false)
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const db = UserLevelsDB.getInstance();

    const user: User = this.getParamValue(interaction, PARAM_TYPES.USER, "user") || interaction.user;

    const userLevel = db.getUser(user.id);
  }
}
