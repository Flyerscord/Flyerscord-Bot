import { AttachmentBuilder, ChatInputCommandInteraction, User } from "discord.js";
import SlashCommand, { PARAM_TYPES } from "../../../../common/models/SlashCommand";
import LevelsDB from "../../providers/Levels.Database";
import { createImage } from "../../utils/imageGeneration";
import LevelExpDB from "../../providers/LevelExp.Database";

export default class RankCommand extends SlashCommand {
  constructor() {
    super("rank", "Get your rank or the rank of an user");

    this.data.addUserOption((option) => option.setName("user").setDescription("The user to get the rank of").setRequired(false));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userInput: User | undefined = this.getParamValue(interaction, PARAM_TYPES.USER, "user");

    let user: User;
    if (userInput) {
      user = userInput;
    } else {
      user = interaction.user;
    }

    const db = LevelsDB.getInstance();
    const levelExpDB = LevelExpDB.getInstance();
    const userLevel = db.getUser(user.id);

    if (userLevel) {
      const imageBuffer = await createImage(
        userLevel.messageCount,
        userLevel.totalExp,
        levelExpDB.getLevelExp(userLevel.currentLevel + 1),
        userLevel.currentLevel,
        user.username,
      );

      const attachment = new AttachmentBuilder(imageBuffer, { name: "rank.png" });
      interaction.reply({ files: [attachment] });
      return;
    }
    interaction.reply({ content: "You need to send a message before you can use this command!", ephemeral: true });
  }
}
