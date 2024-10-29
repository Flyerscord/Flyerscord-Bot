import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import nhlApi from "nhl-api-wrapper-ts";

import SlashCommand, { PARAM_TYPES } from "../../../../common/models/SlashCommand.js";
import { IStandingsByDateOutput_standings } from "nhl-api-wrapper-ts/dist/interfaces/standings/StandingsByDate.js";
import discord from "../../../../common/utils/discord/discord.js";

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

        const divStandings = this.getDivisionStandings(standings.standings, division);

        const embed = await this.createDivisionEmbed(division, divStandings);
        interaction.reply({ embeds: [embed], ephemeral: false });
      } else if (this.isSubCommand(interaction, "conference")) {
        const conference: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "conference");

        const confStandings = this.getConferenceStandings(standings.standings, conference);

        const embed = await this.createConferenceEmbed(conference, confStandings);
        interaction.reply({ embeds: [embed], ephemeral: false });
      } else if (this.isSubCommand(interaction, "league")) {
        const leagueStandings = this.getLeagueStandings(standings.standings);

        const embeds = await this.createLeagueEmbeds(leagueStandings);
        interaction.reply({ embeds: embeds, ephemeral: false });
      } else if (this.isSubCommand(interaction, "wildcard")) {
        const conference: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "conference");

        const wildcardStandings = this.getConferenceStandings(standings.standings, conference);

        const embeds = await this.createWildcardEmbeds(conference, wildcardStandings);
        interaction.reply({ embeds: embeds, ephemeral: false });
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

    embed.setTitle(`${division} Division Standings`);
    standings.forEach((standing) => {
      const teamName = standing.teamName.default;
      const teamEmoji = discord.emojis.getEmojiByName(standing.teamCommonName.default.toLowerCase());

      embed.addFields({
        name: `${standing.divisionSequence}) ${teamEmoji} ${teamName}`,
        value: `GP: ${standing.gamesPlayed} | Pts: ${standing.points} | Record: ${standing.wins}-${standing.losses}-${standing.otLosses} | Goal Dif: ${standing.goalDifferential} | Streak: ${standing.streakCode}${standing.streakCount}`,
      });
    });

    embed.setColor("NotQuiteBlack");
    embed.setTimestamp(Date.now());
    return embed;
  }

  private createConferenceEmbed(conference: string, standings: IStandingsByDateOutput_standings[]): EmbedBuilder {
    const embed = new EmbedBuilder();

    embed.setTitle(`${conference} Conference Standings`);
    standings.forEach((standing) => {
      const teamName = standing.teamName.default;
      const teamEmoji = discord.emojis.getEmojiByName(standing.teamCommonName.default.toLowerCase());

      embed.addFields({
        name: `${standing.conferenceSequence}) ${teamEmoji} ${teamName}`,
        value: `GP: ${standing.gamesPlayed} | Pts: ${standing.points} | Record: ${standing.wins}-${standing.losses}-${standing.otLosses} | Goal Dif: ${standing.goalDifferential} | Streak: ${standing.streakCode}${standing.streakCount}`,
      });
    });

    return embed;
  }

  private createLeagueEmbeds(standings: IStandingsByDateOutput_standings[]): EmbedBuilder[] {
    const embeds = new Array<EmbedBuilder>();

    const maxFieldsPerEmbed = 25;
    const numberOfEmbeds = Math.ceil(standings.length / maxFieldsPerEmbed);

    let startingIndex = 0;
    for (let i = 0; i < numberOfEmbeds; i++) {
      const embed = new EmbedBuilder();

      embed.setTitle(`League Standings Part ${i + 1}`);
      embed.setColor("NotQuiteBlack");
      embed.setTimestamp(Date.now());

      // Get the standings for the current embed number
      const cutStandings = standings.slice(startingIndex, startingIndex + maxFieldsPerEmbed);
      startingIndex += maxFieldsPerEmbed;

      // Add the fields to the embed
      cutStandings.forEach((standing) => {
        const teamName = standing.teamName.default;
        const teamEmoji = discord.emojis.getEmojiByName(standing.teamCommonName.default.toLowerCase());

        embed.addFields({
          name: `${standing.leagueSequence}) ${teamEmoji} ${teamName}`,
          value: `GP: ${standing.gamesPlayed} | Pts: ${standing.points} | Record: ${standing.wins}-${standing.losses}-${standing.otLosses} | Goal Dif: ${standing.goalDifferential} | Streak: ${standing.streakCode}${standing.streakCount}`,
        });
      });

      embeds.push(embed);
    }

    return embeds;
  }
  private createWildcardEmbeds(conference: string, standings: IStandingsByDateOutput_standings[]): EmbedBuilder[] {
    const embeds = new Array<EmbedBuilder>();

    // Get the division names that are in the conference
    const divisions: string[] = [];
    standings.forEach((standing) => {
      const division = standing.divisionName;
      if (!divisions.includes(division)) {
        divisions.push(division);
      }
    });

    // Create embeds for division leaders
    divisions.forEach((division) => {
      const embed = new EmbedBuilder();
      embed.setTitle(`${division} Division Leaders`);

      const divisionStandings = this.getDivisionStandings(standings, division);

      // Only output the top 3 leaders
      for (let i = 0; i < 3; i++) {
        const standing = divisionStandings[i];

        const teamName = standing.teamName.default;
        const teamEmoji = discord.emojis.getEmojiByName(standing.teamCommonName.default.toLowerCase());
        embed.addFields({
          name: `${standing.divisionSequence}) ${teamEmoji} ${teamName}`,
          value: `GP: ${standing.gamesPlayed} | Pts: ${standing.points} | Record: ${standing.wins}-${standing.losses}-${standing.otLosses} | Goal Dif: ${standing.goalDifferential} | Streak: ${standing.streakCode}${standing.streakCount}`,
        });
      }

      embeds.push(embed);
    });

    // Create embed for the wild card teams
    const wildcardStandings = this.getWildcardStandings(standings);
    if (wildcardStandings.length > 0) {
      const embed = new EmbedBuilder();
      embed.setTitle(`${conference} Wildcard Standings`);
      embed.setColor("NotQuiteBlack");
      embed.setTimestamp(Date.now());

      wildcardStandings.forEach((standing) => {
        const teamName = standing.teamName.default;
        const teamEmoji = discord.emojis.getEmojiByName(standing.teamCommonName.default.toLowerCase());
        embed.addFields({
          name: `${standing.wildcardSequence}) ${teamEmoji} ${teamName}${standing.wildcardSequence == 1 || standing.wildcardSequence == 2 ? "*" : ""}`,
          value: `GP: ${standing.gamesPlayed} | Pts: ${standing.points} | Record: ${standing.wins}-${standing.losses}-${standing.otLosses} | Goal Dif: ${standing.goalDifferential} | Streak: ${standing.streakCode}${standing.streakCount}`,
        });
      });

      embeds.push(embed);
    }

    return embeds;
  }

  private getDivisionStandings(standings: IStandingsByDateOutput_standings[], division: string): IStandingsByDateOutput_standings[] {
    return standings.filter((standing) => standing.divisionName == division).sort((a, b) => b.divisionSequence - a.divisionSequence);
  }

  private getConferenceStandings(standings: IStandingsByDateOutput_standings[], conference: string): IStandingsByDateOutput_standings[] {
    return standings.filter((standing) => standing.conferenceName == conference).sort((a, b) => b.conferenceSequence - a.conferenceSequence);
  }

  private getLeagueStandings(standings: IStandingsByDateOutput_standings[]): IStandingsByDateOutput_standings[] {
    return standings.sort((a, b) => b.leagueSequence - a.leagueSequence);
  }

  private getWildcardStandings(standings: IStandingsByDateOutput_standings[]): IStandingsByDateOutput_standings[] {
    return standings.filter((standing) => standing.wildcardSequence != 0).sort((a, b) => b.wildcardSequence - a.wildcardSequence);
  }
}
