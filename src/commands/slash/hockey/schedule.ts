import { ChatInputCommandInteraction } from "discord.js";

import { PARAM_TYPES, SlashCommand } from "../../models/SlashCommand";
import NHLApi from "../../util/nhlApi";
import discord from "../../util/discord/discord";

export default class ScheduleCommand extends SlashCommand {
  constructor() {
    super("schedule", "Get the Flyer's Schedule");

    this.data.addIntegerOption((option) =>
      option
        .setName("games")
        .setDescription("The number of games to display. Defaults to 5")
        .setMinValue(1)
        .setMaxValue(25)
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const gamesToPrint: number = this.getParamValue(interaction, PARAM_TYPES.INTEGER, "games") || 5;

    const d = new Date();

    const nextYear = d.getFullYear() + 1;
    const currentMonth = d.getMonth() + 1;

    let nextDate = d.getDate();
    if (currentMonth == 2 && nextDate == 29) {
      nextDate = 28;
    }

    const startDate = d.getFullYear() + "-" + currentMonth + "-" + d.getDate();
    const endDate = nextYear + "-" + currentMonth + "-" + nextDate;

    const res = await NHLApi.get(`schedule?teamId=4&startDate=${startDate}&endDate=${endDate}`);
    if (res.statusCode == 200) {
      const embed = discord.embeds.getScheduleEmbed(res.data, gamesToPrint);
      interaction.reply({ embeds: [embed] });
      return;
    }

    interaction.reply({ content: "Error getting schedule!", ephemeral: true });
  }
}
