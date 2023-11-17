import { ChatInputCommandInteraction } from "discord.js";

import { PARAM_TYPES, SlashCommand } from "../../../models/SlashCommand";
import NHLApi from "../../../util/nhlApi";
import discord from "../../../util/discord/discord";
import Logger from "stumper";

export default class StandingsCommand extends SlashCommand {
  constructor() {
    super("standings", "Get the league standings");

    this.data
      .addSubcommand((subcommand) =>
        subcommand
          .setName("division")
          .setDescription("Show the division standings")
          .addStringOption((option) =>
            option
              .setName("division")
              .setDescription("The division to be displayed. Defaults to Metro")
              .addChoices(
                { name: "Metropolitan", value: "0" },
                { name: "Atlantic", value: "1" },
                { name: "Central", value: "2" },
                { name: "Pacific", value: "3" }
              )
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("conference")
          .setDescription("Show the conference standings")
          .addStringOption((option) =>
            option
              .setName("conference")
              .setDescription("The conference to be displayed. Defaults to East")
              .addChoices({ name: "Eastern", value: "0" }, { name: "Western", value: "1" })
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("wildcard")
          .setDescription("Show the wildcard standings")
          .addStringOption((option) =>
            option
              .setName("conference")
              .setDescription("The conference to be displayed. Defaults to East")
              .addChoices({ name: "Eastern", value: "0" }, { name: "Western", value: "1" })
          )
      )
      .addSubcommand((subcommand) => subcommand.setName("league").setDescription("Show the league standings"));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (this.isSubCommand(interaction, "division")) {
      const division = parseInt(this.getParamValue(interaction, PARAM_TYPES.STRING, "division") || "0"); // Defaults to Metropolitan
      const res = await NHLApi.get("standings/byDivision");
      if (res.statusCode == 200) {
        const embed = discord.embeds.getDivisionalStandingsEmbed(res.data, division);
        interaction.reply({ embeds: [embed] });
        return;
      }
    } else if (this.isSubCommand(interaction, "conference")) {
      const conference = parseInt(this.getParamValue(interaction, PARAM_TYPES.STRING, "conference") || "0"); // Defaults to Eastern
      const res = await NHLApi.get("standings/byConference");
      if (res.statusCode == 200) {
        const embed = discord.embeds.getConferenceStandingsEmbed(res.data, conference);
        interaction.reply({ embeds: [embed] });
        return;
      }
    } else if (this.isSubCommand(interaction, "wildcard")) {
      const conference = parseInt(this.getParamValue(interaction, PARAM_TYPES.STRING, "conference") || "0"); // Defaults to Eastern
      const res = await NHLApi.get("standings/wildCardWithLeaders");
      if (res.statusCode == 200) {
        const div1Embed = discord.embeds.getWildcardStandingsDivLeaderEmbed(res.data, conference, 0);
        const div2Embed = discord.embeds.getWildcardStandingsDivLeaderEmbed(res.data, conference, 1);
        const wildCardEmbed = discord.embeds.getWildcardStandingsEmbed(res.data, conference);
        interaction.reply({ embeds: [div1Embed, div2Embed, wildCardEmbed] });
        return;
      }
    } else if (this.isSubCommand(interaction, "league")) {
      const res = await NHLApi.get("standings/byLeague");
      if (res.statusCode == 200) {
        const p1Embed = discord.embeds.getLeagueStandingsEmbed(res.data, 1);
        const p2Embed = discord.embeds.getLeagueStandingsEmbed(res.data, 2);
        interaction.reply({ embeds: [p1Embed, p2Embed] });
        return;
      }
    }

    Logger.error("There was an error running the command!", "StandingsCommand");
    interaction.reply({ content: "Error running command!", ephemeral: true });
  }
}
