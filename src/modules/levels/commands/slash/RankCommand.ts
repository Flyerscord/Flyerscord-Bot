import { ChatInputCommandInteraction, User } from "discord.js";
import SlashCommand, { PARAM_TYPES } from "../../../../common/models/SlashCommand.js";
import LevelsDB from "../../providers/Levels.Database";
import { createImage } from "../../utils/imageGeneration.js";

export default class RankCommand extends SlashCommand {
  constructor() {
    super("rank", "Get your rank or the rank of an user");

    this.data.addUserOption((option) => option.setName("user").setDescription("The user to get the rank of").setRequired(false));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user: User | undefined = this.getParamValue(interaction, PARAM_TYPES.USER, "user");

    let userId = interaction.user.id;
    if (user) {
      userId = user.id;

      const db = LevelsDB.getInstance();
      const userLevel = db.getUser(userId);

      if (userLevel) {
        const imageBuffer = await createImage(
          userLevel.messageCount,
          userLevel.totalExp,
          userLevel.currentLevel,
          userLevel.currentLevel,
          user.username,
        );

        interaction.reply({ files: [imageBuffer] });
      }
    }
  }
}
