import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  MessageActionRowComponentBuilder,
} from "discord.js";

import SlashCommand from "../../../../common/models/SlashCommand.js";
import LevelsDB from "../../providers/Levels.Database";
import { IUserLevel } from "../../interfaces/IUserLevel.js";

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
    const message = await interaction.reply({
      embeds: [this.createEmbedPage(users, currentPage)],
      components: [row],
      fetchReply: true,
    });

    // Create a collector to handle button interactions
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000, // 1 minute collector
    });

    collector.on("collect", async (interaction) => {
      // Ensure the user who clicked the button is the one who initiated the command
      if (interaction.user.id !== interaction.user.id) {
        return interaction.reply({ content: "These buttons aren't for you!", ephemeral: true });
      }

      if (interaction.customId === "next") {
        currentPage++;
        if (currentPage > totalPages) {
          currentPage = totalPages;
        }
      } else if (interaction.customId === "prev") {
        currentPage--;
        if (currentPage < 1) {
          currentPage = 1;
        }
      }

      // Update button states based on current page
      prevButton.setDisabled(currentPage === 0);
      nextButton.setDisabled(currentPage === totalPages - 1);

      // Update the embed and buttons
      await interaction.update({
        embeds: [this.createEmbedPage(users, currentPage)],
        components: [row],
      });
    });
  }

  private createEmbedPage(data: Array<IUserLevel>, pageNumber: number): EmbedBuilder {
    const embed = new EmbedBuilder();

    embed.setTitle("User Leaderboard");
    embed.setDescription(`Page ${pageNumber} of ${Math.ceil(data.length / this.EMBED_PAGE_SIZE)}`);
    embed.setColor("Random");
    embed.setTimestamp(Date.now());

    const startingIndex = (pageNumber - 1) * this.EMBED_PAGE_SIZE;
    const endingIndex = startingIndex + this.EMBED_PAGE_SIZE;

    for (let i = startingIndex; i < endingIndex; i++) {
      const user = data[i];

      embed.addFields({
        name: `${user.currentLevel}) ${user.userId}`,
        value: `Total Messages: ${user.messageCount} | Total Exp: ${user.totalExp}`,
      });
    }

    return embed;
  }
}
