import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import nhlApi from "nhl-api-wrapper-ts";

import SlashCommand, { PARAM_TYPES } from "../../../../common/models/SlashCommand";
import { TEAM_TRI_CODE } from "nhl-api-wrapper-ts/dist/interfaces/Common";
import { IClubScheduleNowOutput } from "nhl-api-wrapper-ts/dist/interfaces/club/schedule/ClubScheduleNow";
import Time from "../../../../common/utils/Time";
import { NHL_EMOJI_GUILD_ID } from "../../../../common/utils/discord/emojis";
import discord from "../../../../common/utils/discord/discord";
import Stumper from "stumper";

export default class ScheduleCommand extends SlashCommand {
  constructor() {
    super("schedule", "Get the upcoming NHL schedule");

    this.data.addIntegerOption((option) =>
      option.setName("number").setDescription("The number of upcoming games to get. Default: 5").setMinValue(1).setMaxValue(10).setRequired(false),
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const numberOfGames: number = this.getParamValue(interaction, PARAM_TYPES.INTEGER, "number") || 5;

    const response = await nhlApi.teams.schedule.getCurrentTeamSchedule({ team: TEAM_TRI_CODE.PHILADELPHIA_FLYERS });

    if (response.status == 200) {
      const schedule = response.data;

      const embed = await this.createEmbed(numberOfGames, schedule);
      interaction.followUp({ embeds: [embed], ephemeral: false });
    } else {
      interaction.editReply({
        content: "Error fetching the schedule!",
      });
    }
  }

  private async createEmbed(numberOfGames: number, schedule: IClubScheduleNowOutput): Promise<EmbedBuilder> {
    const embed = new EmbedBuilder();

    if (numberOfGames == 1) {
      embed.setTitle("Next Upcoming Flyers Game");
    } else {
      embed.setTitle(`Next ${numberOfGames} Upcoming Flyers Games`);
    }

    const notPlayedYet = schedule.games.filter((game) => game.gameState == "FUT");

    const totalGames = Math.min(numberOfGames, notPlayedYet.length);

    for (let i = 0; i < totalGames; i++) {
      const game = notPlayedYet[i];

      const date = new Date(game.startTimeUTC);

      const gameDate = Time.getFormattedDateTimeWithoutSeconds(date);

      const teams = await nhlApi.teams.getTeams({ lang: "en" });
      const franchises = await nhlApi.teams.getFranchiseInfo({ lang: "en" });

      if (teams.status == 200 && franchises.status == 200) {
        const awayTeam = teams.data.data.find((team) => team.id == game.awayTeam.id);
        const homeTeam = teams.data.data.find((team) => team.id == game.homeTeam.id);
        const awayFranchise = franchises.data.data.find((franchise) => franchise.id == awayTeam?.franchiseId);
        const homeFranchise = franchises.data.data.find((franchise) => franchise.id == homeTeam?.franchiseId);

        if (awayTeam && homeTeam && awayFranchise && homeFranchise) {
          const awayTeamEmoji = await discord.emojis.getClientEmojiByNameAndGuildID(
            awayFranchise.teamCommonName.toLowerCase().replaceAll(" ", ""),
            NHL_EMOJI_GUILD_ID,
          );
          const homeTeamEmoji = await discord.emojis.getClientEmojiByNameAndGuildID(
            homeFranchise.teamCommonName.toLowerCase().replaceAll(" ", ""),
            NHL_EMOJI_GUILD_ID,
          );
          embed.addFields({
            name: gameDate,
            value: `${awayTeamEmoji} ${awayTeam.fullName} @ ${homeTeam.fullName} ${homeTeamEmoji}`,
          });
        }
      } else {
        Stumper.error(`Error fetching teams or franchises`, "nhl:ScheduleCommand:createEmbed");
      }
    }

    embed.setTimestamp(Date.now());
    embed.setColor(0xf74902);
    return embed;
  }
}
