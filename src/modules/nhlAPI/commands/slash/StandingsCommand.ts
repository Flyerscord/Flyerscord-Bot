import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import nhlApi from "nhl-api-wrapper-ts";

import SlashCommand, { PARAM_TYPES } from "../../../../common/models/SlashCommand";
import { IStandingsByDateOutput_standings } from "nhl-api-wrapper-ts/dist/interfaces/standings/StandingsByDate";

export default class StandingsCommand extends SlashCommand {
  constructor() {
    super("standings", "Get the NHL standings");

    this.data
      .addSubcommand((subcmd) =>
        subcmd
          .setName("division")
          .setDescription("Get the divisional standings")
          .addStringOption((option) =>
            option
              .setName("division")
              .setDescription("The division to get the standings for")
              .setRequired(true)
              .addChoices(
                { name: "Metro", value: "Metropolitan" },
                { name: "Atlantic", value: "Atlantic" },
                { name: "Central", value: "Central" },
                { name: "Pacific", value: "Pacific" },
              ),
          ),
      )
      .addSubcommand((subcmd) =>
        subcmd
          .setName("conference")
          .setDescription("Get the conference standings")
          .addStringOption((option) =>
            option
              .setName("conference")
              .setDescription("The conference to get the standings for")
              .setRequired(true)
              .addChoices({ name: "East", value: "Eastern" }, { name: "West", value: "Western" }),
          ),
      )
      .addSubcommand((subcmd) => subcmd.setName("league").setDescription("Get the league standings"))
      .addSubcommand((subcmd) =>
        subcmd
          .setName("wildcard")
          .setDescription("Get the wildcard standings")
          .addStringOption((option) =>
            option
              .setName("conference")
              .setDescription("The conference to get the standings for")
              .setRequired(true)
              .addChoices({ name: "Eastern", value: "Eastern" }, { name: "Western", value: "Western" }),
          ),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const res = await nhlApi.teams.standings.getCurrentStandings();

    if (res.status == 200) {
      const standings = res.data;
      if (this.isSubCommand(interaction, "division")) {
        const division: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "division");

        const divStandings = standings.standings
          .filter((team) => team.divisionName == division)
          .sort((a, b) => b.divisionSequence - a.divisionSequence);

        const embed = await this.createDivisionEmbed(division, divStandings);
        interaction.reply({ embeds: [embed], ephemeral: false });
      } else if (this.isSubCommand(interaction, "conference")) {
        const conference: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "conference");

        const confStandings = standings.standings
          .filter((team) => team.conferenceName == conference)
          .sort((a, b) => b.conferenceSequence - a.conferenceSequence);

        const embed = await this.createConferenceEmbed(conference, confStandings);
        interaction.reply({ embeds: [embed], ephemeral: false });
      } else if (this.isSubCommand(interaction, "league")) {
        const leagueStandings = standings.standings.sort((a, b) => b.leagueSequence - a.leagueSequence);

        const embed = await this.createLeagueEmbed(leagueStandings);
        interaction.reply({ embeds: [embed], ephemeral: false });
      } else if (this.isSubCommand(interaction, "wildcard")) {
        const conference: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "conference");

        const wildcardStandings = standings.standings
          .filter((team) => team.conferenceName == conference)
          .sort((a, b) => b.wildcardSequence - a.wildcardSequence);

        const embed = await this.createWildcardEmbed(conference, wildcardStandings);
        interaction.reply({ embeds: [embed], ephemeral: false });
      }
    } else {
      interaction.reply({
        content: "Error fetching the standings!",
        ephemeral: true,
      });
    }
  }

  private createDivisionEmbed(division: string, standings: IStandingsByDateOutput_standings[]): EmbedBuilder {
    const embed = new EmbedBuilder();

    embed.setTitle(`Division ${division} Standings`);
    // TODO: Implement

    return embed;
  }

  private createConferenceEmbed(conference: string, standings: IStandingsByDateOutput_standings[]): EmbedBuilder {
    const embed = new EmbedBuilder();

    embed.setTitle(`Conference ${conference} Standings`);
    // TODO: Implement

    return embed;
  }

  private createLeagueEmbed(standings: IStandingsByDateOutput_standings[]): EmbedBuilder {
    const embed = new EmbedBuilder();

    embed.setTitle("League Standings");
    // TODO: Implement

    return embed;
  }
  private createWildcardEmbed(conference: string, standings: IStandingsByDateOutput_standings[]): EmbedBuilder {
    const embed = new EmbedBuilder();

    embed.setTitle(`Wildcard ${conference} Standings`);
    // TODO: Implement

    return embed;
  }
}
