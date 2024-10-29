import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import nhlApi from "nhl-api-wrapper-ts";

import SlashCommand, { PARAM_TYPES } from "../../../../common/models/SlashCommand.js";
import { TEAM_TRI_CODE } from "nhl-api-wrapper-ts/dist/interfaces/Common.js";
import { IClubScheduleNowOutput } from "nhl-api-wrapper-ts/dist/interfaces/club/schedule/ClubScheduleNow.js";
import Time from "../../../../common/utils/Time.js";

export default class ScheduleCommand extends SlashCommand {
  constructor() {
    super("schedule", "Get the upcoming NHL schedule");

    this.data.addIntegerOption((option) =>
      option.setName("number").setDescription("The number of upcoming games to get. Default: 5").setMinValue(1).setMaxValue(10).setRequired(false),
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const numberOfGames: number = this.getParamValue(interaction, PARAM_TYPES.INTEGER, "number") || 5;

    const response = await nhlApi.teams.schedule.getCurrentTeamSchedule({ team: TEAM_TRI_CODE.PHILADELPHIA_FLYERS });

    if (response.status == 200) {
      const schedule = response.data;

      const embed = await this.createEmbed(numberOfGames, schedule);
      interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      interaction.reply({
        content: "Error fetching the schedule!",
        ephemeral: true,
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
      const awayTeam = teams.data.data.find((team) => team.id == game.awayTeam.id);
      const homeTeam = teams.data.data.find((team) => team.id == game.homeTeam.id);

      if (awayTeam && homeTeam) {
        embed.addFields({
          name: gameDate,
          value: `${awayTeam.fullName} @ ${homeTeam.fullName}`,
        });
      }
    }

    embed.setTimestamp(Date.now());
    embed.setColor(0xf74902);
    return embed;
  }
}
