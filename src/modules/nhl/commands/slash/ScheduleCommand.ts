import { ChatInputCommandInteraction, EmbedBuilder, time, TimestampStyles } from "discord.js";
import nhlApi from "nhl-api-wrapper-ts";

import SlashCommand, { PARAM_TYPES } from "@common/models/SlashCommand";
import { TEAM_TRI_CODE } from "nhl-api-wrapper-ts/dist/interfaces/Common";
import { IClubScheduleNowOutput } from "nhl-api-wrapper-ts/dist/interfaces/club/schedule/ClubScheduleNow";
import { NHL_EMOJI_GUILD_ID } from "@common/utils/discord/emojis";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";
import CombinedTeamInfoCache from "@common/cache/CombinedTeamInfoCache";

export default class ScheduleCommand extends SlashCommand {
  constructor() {
    super("schedule", "Get the upcoming NHL schedule");

    this.data.addIntegerOption((option) =>
      option.setName("number").setDescription("The number of upcoming games to get. Default: 5").setMinValue(1).setMaxValue(10).setRequired(false),
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const replies = await discord.interactions.createReplies(interaction, "nhl:ScheduleCommand:execute");

    const numberOfGames: number = this.getParamValue(interaction, PARAM_TYPES.INTEGER, "number") || 5;

    const scheduleResponse = await nhlApi.teams.schedule.getCurrentTeamSchedule({ team: TEAM_TRI_CODE.PHILADELPHIA_FLYERS });

    if (scheduleResponse.status == 200) {
      const schedule = scheduleResponse.data;

      const embed = await this.createEmbed(numberOfGames, schedule);
      await replies.reply({ embeds: [embed] });
    } else {
      Stumper.error(
        `Error fetching the schedule data from the NHL API! Status code: ${scheduleResponse.status}`,
        "levels:LeaderboardCommand:execute",
      );
      await replies.reply({ content: "Error fetching the data from the NHL API!", ephemeral: true });
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

      const combinedTeamInfoCache = CombinedTeamInfoCache.getInstance();

      const awayTeam = combinedTeamInfoCache.getTeamByTeamId(game.awayTeam.id);
      const homeTeam = combinedTeamInfoCache.getTeamByTeamId(game.homeTeam.id);

      if (awayTeam && homeTeam) {
        const awayTeamEmoji = await discord.emojis.getClientEmojiByNameAndGuildID(
          awayTeam.franchise.teamCommonName.toLowerCase().replaceAll(" ", ""),
          NHL_EMOJI_GUILD_ID,
        );
        const homeTeamEmoji = await discord.emojis.getClientEmojiByNameAndGuildID(
          homeTeam.franchise.teamCommonName.toLowerCase().replaceAll(" ", ""),
          NHL_EMOJI_GUILD_ID,
        );
        embed.addFields({
          name: `${time(date, TimestampStyles.LongDateTime)}`,
          value: `${awayTeamEmoji} ${awayTeam.franchise.teamCommonName} @ ${homeTeam.franchise.teamCommonName} ${homeTeamEmoji}`,
        });
      }
    }

    embed.setTimestamp(Date.now());
    embed.setColor(0xf74902);
    return embed;
  }
}
