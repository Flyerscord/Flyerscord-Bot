import { AttachmentBuilder, ChatInputCommandInteraction, User } from "discord.js";
import SlashCommand, { PARAM_TYPES } from "@common/models/SlashCommand";
import RankImageGenerator from "../../utils/RankImageGenerator";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";
import LevelsDB from "../../db/LevelsDB";

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

    const member = await discord.members.getMember(user.id);
    if (!member) {
      await this.replies.reply({ content: "Error finding member!", ephemeral: true });
      Stumper.error(`Error finding member for user ${user.id}`, "levels:RankCommand:createEmbed");
      return;
    }

    const profilePictureUrl = member.displayAvatarURL() || user.displayAvatarURL();
    const username = member.displayName || user.username;

    const db = new LevelsDB();
    const userLevel = await db.getUser(user.id);
    const rank = (await db.getUserRank(user.id)) + 1;

    if (rank == -1) {
      await this.replies.reply({ content: "Error finding rank! You may need to send a message first!", ephemeral: true });
      Stumper.error(`Error finding rank for user ${user.id}`, "levels:RankCommand:createEmbed");
      return;
    }

    if (userLevel) {
      const rankImageGenerator = new RankImageGenerator(
        userLevel.messageCount,
        userLevel.totalExperience,
        await db.getLevelExp(userLevel.currentLevel + 1),
        userLevel.currentLevel,
        rank,
        username,
        profilePictureUrl,
      );
      let imageBuffer: Buffer;
      try {
        imageBuffer = await rankImageGenerator.getImage();
      } catch (error) {
        Stumper.caughtError(error, "levels:RankCommand:execute");
        return;
      }

      const attachment = new AttachmentBuilder(imageBuffer, { name: "rank.png" });
      await this.replies.reply({ files: [attachment] });
      return;
    }
    await this.replies.reply({ content: "You need to send a message before you can use this command!", ephemeral: true });
  }
}
