import { ChatInputCommandInteraction, User } from "discord.js";
import SlashCommand, { PARAM_TYPES } from "../../../models/SlashCommand";
import LevelsDB from "../../../providers/Levels.Database";

export default class LeaderboardCommand extends SlashCommand {
  constructor() {
    super("leaderboard", "Print the leaderboard");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user: User | undefined = this.getParamValue(interaction, PARAM_TYPES.USER, "user");

    let userId = interaction.user.id;
    if (user) {
      userId = user.id;
    }

    const db = LevelsDB.getInstance();
    const userLevel = db.getUser(userId);

    // TODO: Print embed with info about the users level
  }
}
