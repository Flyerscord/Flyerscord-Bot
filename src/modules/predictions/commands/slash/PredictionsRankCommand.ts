import { AutocompleteInteraction, bold, ChatInputCommandInteraction } from "discord.js";
import { AutocompleteSlashCommand } from "@common/models/SlashCommand";
import discord from "@common/utils/discord/discord";
import PredictionsDB from "../../db/PredictionsDB";
import { CURRENT_SEASON_OPTION, getSeasonAutocompleteOptions, resolveSeasonOption } from "../../utils/seasonOption";

export default class PredictionsRankCommand extends AutocompleteSlashCommand {
  constructor() {
    super("predictrank", "Get your score predictions rank or the rank of another user");

    this.data
      .addUserOption((option) => option.setName("user").setDescription("The user to get the rank of").setRequired(false))
      .addStringOption((option) =>
        option.setName("season").setDescription(`Season to show (defaults to ${CURRENT_SEASON_OPTION})`).setRequired(false).setAutocomplete(true),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = this.getUserParamValue(interaction, "user", interaction.user);
    const seasonOption = this.getStringParamValue(interaction, "season", CURRENT_SEASON_OPTION);

    const db = new PredictionsDB();
    const resolved = await resolveSeasonOption(db, seasonOption);
    if (!resolved) {
      await this.replies.reply({ content: "Invalid season! Use `current`, `all-time`, or a season number like `20252026`.", ephemeral: true });
      return;
    }

    const member = await discord.members.getMember(user.id);
    const username = member?.displayName || user.username;

    const rank = await db.getUserRank(user.id, resolved.season);
    if (rank === -1) {
      await this.replies.reply(`${username} has no resolved predictions for ${resolved.label}.`);
      return;
    }

    const points = await db.getUserPoints(user.id, resolved.season);
    await this.replies.reply(`${username}'s rank for ${resolved.label}: ${bold(`#${rank}`)} with ${bold(points.toString())} points.`);
  }

  protected async getAutoCompleteOptions(interaction: AutocompleteInteraction): Promise<string[] | undefined> {
    const focusedName = this.getFocusedOptionName(interaction);
    if (focusedName !== "season") {
      return undefined;
    }

    return getSeasonAutocompleteOptions(new PredictionsDB());
  }
}
