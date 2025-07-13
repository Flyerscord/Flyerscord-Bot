import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  MessageActionRowComponentBuilder,
} from "discord.js";

import SlashCommand from "@common/models/SlashCommand";
import LevelsDB from "../../providers/Levels.Database";
import { IUserLevel } from "../../interfaces/IUserLevel";
import discord from "@common/utils/discord/discord";
import LevelExpDB from "../../providers/LevelExp.Database";
import { formatExp, getShortenedMessageCount } from "../../utils/leveling";
import Stumper from "stumper";

export default class LeaderboardCommand extends SlashCommand {
  private readonly EMBED_PAGE_SIZE = 25;

  constructor() {
    super("leaderboard", "Print the leaderboard");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const db = LevelsDB.getInstance();
    const users = db.getAllUsersSortedByExp();
    const totalPages = Math.ceil(users.length / this.EMBED_PAGE_SIZE);

    let currentPage = 1;

    const nextButton = new ButtonBuilder()
      .setCustomId("next")
      .setLabel("Next")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === totalPages); // Disable if on last page

    const prevButton = new ButtonBuilder()
      .setCustomId("prev")
      .setLabel("Previous")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage === 1); // Disable if on first page

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(prevButton, nextButton);

    // Send the initial message with the first page and buttons
    const message = await this.replies.reply({ embeds: [await this.createEmbedPage(users, currentPage)], components: [row] });

    if (!message) {
      return;
    }

    // Create a collector to handle button interactions
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000, // 1 minute collector
    });

    collector.on("collect", async (i) => {
      // Ensure the user who clicked the button is the one who initiated the command
      if (interaction.user.id !== i.user.id) {
        return i.reply({ content: "These buttons aren't for you!", ephemeral: true });
      }

      await i.deferUpdate();

      if (i.customId === "next") {
        currentPage++;
        if (currentPage > totalPages) {
          currentPage = totalPages;
        }
      } else if (i.customId === "prev") {
        currentPage--;
        if (currentPage < 1) {
          currentPage = 1;
        }
      }

      // Update button states based on current page
      prevButton.setDisabled(currentPage === 0);
      nextButton.setDisabled(currentPage === totalPages);

      // Update the embed and buttons
      this.replies.reply({ embeds: [await this.createEmbedPage(users, currentPage)], components: [row] });
    });

    collector.on("end", async () => {
      prevButton.setDisabled(true);
      nextButton.setDisabled(true);
      this.replies.reply({ components: [row] });
    });
  }

  private async createEmbedPage(data: IUserLevel[], pageNumber: number): Promise<EmbedBuilder> {
    const embed = new EmbedBuilder();
    const levelExpDB = LevelExpDB.getInstance();

    embed.setTitle("User Leaderboard");
    embed.setFooter({ text: `Page ${pageNumber} of ${Math.ceil(data.length / this.EMBED_PAGE_SIZE)}` });
    embed.setColor("Random");
    embed.setTimestamp(Date.now());

    const startingIndex = (pageNumber - 1) * this.EMBED_PAGE_SIZE;
    const endingIndex = Math.min(startingIndex + this.EMBED_PAGE_SIZE, data.length);

    for (let i = startingIndex; i < endingIndex; i++) {
      const user = data[i];
      const member = await discord.members.getMember(user.userId);

      if (!member) {
        Stumper.debug(`Failed to find member with user id: ${user.userId}. User probably left server`, "levels:LeaderboardCommand:createEmbedPage");
        continue;
      }
      const username = member ? member.displayName || member.user.username : user.userId;

      embed.addFields({
        name: `${i + 1}) ${username}`,
        value: `**Level:** ${user.currentLevel} | **Total Messages:** ${getShortenedMessageCount(user.messageCount)} | **Total Exp:** ${formatExp(user.totalExp)} | **Exp to next level:** ${formatExp(levelExpDB.getLevelExp(user.currentLevel + 1) - user.totalExp)}`,
      });
    }

    return embed;
  }
}
