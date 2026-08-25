import {
  ActionRowBuilder,
  AutocompleteInteraction,
  bold,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  MessageActionRowComponentBuilder,
} from "discord.js";
import { AutocompleteSlashCommand } from "@common/models/SlashCommand";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";
import PredictionsDB, { LeaderboardEntry } from "../../db/PredictionsDB";
import { CURRENT_SEASON_OPTION, getSeasonAutocompleteOptions, resolveSeasonOption } from "../../utils/seasonOption";

export default class PredictionsLeaderboardCommand extends AutocompleteSlashCommand {
  private readonly EMBED_PAGE_SIZE = 25;

  constructor() {
    super("predictleaderboard", "Print the score predictions leaderboard");

    this.data.addStringOption((option) =>
      option.setName("season").setDescription(`Season to show (defaults to ${CURRENT_SEASON_OPTION})`).setRequired(false).setAutocomplete(true),
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const seasonOption = this.getStringParamValue(interaction, "season", CURRENT_SEASON_OPTION);
    const db = new PredictionsDB();

    const resolved = await resolveSeasonOption(db, seasonOption);
    if (!resolved) {
      await this.replies.reply({ content: "Invalid season! Use `current`, `all-time`, or a season number like `20252026`.", ephemeral: true });
      return;
    }

    const entries = await db.getLeaderboard(resolved.season);
    if (entries.length === 0) {
      await this.replies.reply({ content: `No resolved predictions found for ${resolved.label}!`, ephemeral: true });
      return;
    }

    const title = `Score Predictions Leaderboard (${resolved.label})`;
    const totalPages = Math.ceil(entries.length / this.EMBED_PAGE_SIZE);
    let currentPage = 1;

    const nextButton = new ButtonBuilder()
      .setCustomId("next")
      .setLabel("Next")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === totalPages);
    const prevButton = new ButtonBuilder()
      .setCustomId("prev")
      .setLabel("Previous")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage === 1);
    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(prevButton, nextButton);

    const message = await this.replies.reply({ embeds: [await this.createEmbedPage(title, entries, currentPage, totalPages)], components: [row] });
    if (!message) {
      return;
    }

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (interaction.user.id !== i.user.id) {
        return i.reply({ content: "These buttons aren't for you!", ephemeral: true });
      }

      await i.deferUpdate();

      if (i.customId === "next") {
        currentPage = Math.min(currentPage + 1, totalPages);
      } else if (i.customId === "prev") {
        currentPage = Math.max(currentPage - 1, 1);
      }

      prevButton.setDisabled(currentPage === 1);
      nextButton.setDisabled(currentPage === totalPages);

      await i.editReply({ embeds: [await this.createEmbedPage(title, entries, currentPage, totalPages)], components: [row] });
    });

    collector.on("end", async () => {
      prevButton.setDisabled(true);
      nextButton.setDisabled(true);
      await this.replies.reply({ components: [row] });
    });
  }

  private async createEmbedPage(title: string, entries: LeaderboardEntry[], pageNumber: number, totalPages: number): Promise<EmbedBuilder> {
    const embed = new EmbedBuilder();

    embed.setTitle(title);
    embed.setFooter({ text: `Page ${pageNumber} of ${totalPages}` });
    embed.setColor("Random");
    embed.setTimestamp(Date.now());

    const startingIndex = (pageNumber - 1) * this.EMBED_PAGE_SIZE;
    const endingIndex = Math.min(startingIndex + this.EMBED_PAGE_SIZE, entries.length);

    for (let i = startingIndex; i < endingIndex; i++) {
      const entry = entries[i];
      const member = await discord.members.getMember(entry.userId, false);

      let username = "Unknown User";
      if (member) {
        username = member.displayName || member.user.username;
      } else {
        Stumper.debug(
          `Failed to find member with user id: ${entry.userId}. User probably left server`,
          "predictions:PredictionsLeaderboardCommand:createEmbedPage",
        );
        const discordUser = await discord.users.getUser(entry.userId, true);
        if (discordUser) {
          username = discordUser.displayName || discordUser.username;
        }
      }

      embed.addFields({ name: `${i + 1}) ${username}`, value: `${bold("Points:")} ${entry.points}` });
    }

    return embed;
  }

  protected async getAutoCompleteOptions(interaction: AutocompleteInteraction): Promise<string[] | undefined> {
    const focusedName = this.getFocusedOptionName(interaction);
    if (focusedName !== "season") {
      return undefined;
    }

    return getSeasonAutocompleteOptions(new PredictionsDB());
  }
}
