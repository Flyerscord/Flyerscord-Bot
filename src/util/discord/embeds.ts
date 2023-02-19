import { EmbedBuilder } from "discord.js";
import Config from "../../config/Config";

export function getVistorRoleReactEmbed(): EmbedBuilder {
  const embed = new EmbedBuilder();

  const visitorEmoji = Config.getConfig().vistorReactRole.visitorEmoji;

  embed.setTitle("Visitor Role Selection");
  embed.setDescription(`${visitorEmoji} Get the Visitor Role (Everyone else will get the member role)`);
  embed.setColor("NotQuiteBlack");

  return embed;
}

export function getDivisionalStandingsEmbed(data: any, division: number): EmbedBuilder {
  const embed = new EmbedBuilder();

  const whichDivision = data.records[division];
  const divisionName = whichDivision.division.name;

  embed.setTitle(`NHL Standings: ${divisionName}`);
  embed.setColor("NotQuiteBlack");

  // Loop through the teams in the division
  for (let i = 0; i < whichDivision.teamRecords.length; i++) {
    const whichTeam = whichDivision.teamRecords[i];
    const teamName = whichTeam.team.name;

    const goalDif = whichTeam.goalsScored - whichTeam.goalsAgainst;

    embed.addFields({
      name: `${whichTeam.divisionRank}) ${teamName}`,
      value: `GP: ${whichTeam.gamesPlayed} | Points: ${whichTeam.points} | Record: ${whichTeam.leagueRecord.wins}-${whichTeam.leagueRecord.losses}-${whichTeam.leagueRecord.ot} | Goal Dif: ${goalDif} | Streak: ${whichTeam.streak.streakCode}`,
    });
  }

  return embed;
}

export function getConferenceStandingsEmbed(data: any, conference: number): EmbedBuilder {
  const embed = new EmbedBuilder();

  const whichConference = data.records[conference];
  const conferenceName = whichConference.conference.name;

  embed.setTitle(`NHL Standings: ${conferenceName}`);
  embed.setColor("NotQuiteBlack");

  // Loop through the teams in the conference
  for (let i = 0; i < whichConference.teamRecords.length; i++) {
    const whichTeam = whichConference.teamRecords[i];
    const teamName = whichTeam.team.name;

    const goalDif = whichTeam.goalsScored - whichTeam.goalsAgainst;

    embed.addFields({
      name: `${whichTeam.conferenceRank}) ${teamName}`,
      value: `GP: ${whichTeam.gamesPlayed} | Points: ${whichTeam.points} | Record: ${whichTeam.leagueRecord.wins}-${whichTeam.leagueRecord.losses}-${whichTeam.leagueRecord.ot} | Goal Dif: ${goalDif} | Streak: ${whichTeam.streak.streakCode}`,
    });
  }

  return embed;
}

export function getWildcardStandingsDivLeaderEmbed(data: any, conference: number, div: number): EmbedBuilder {
  const embed = new EmbedBuilder();

  let division: number;
  if (conference == 0) {
    division = 2 + div;
  } else {
    division = 4 + div;
  }

  const whichDivision = data.records[division];
  const divisionName = whichDivision.division.name;

  embed.setTitle(`NHL Standings: ${divisionName} Leaders`);
  embed.setColor("NotQuiteBlack");

  // Loop through the teams in the division leaders
  for (let i = 0; i < whichDivision.teamRecords.length; i++) {
    const whichTeam = whichDivision.teamRecords[i];
    const teamName = whichTeam.team.name;

    const goalDif = whichTeam.goalsScored - whichTeam.goalsAgainst;

    embed.addFields({
      name: `${whichTeam.divisionRank}) ${teamName}`,
      value: `GP: ${whichTeam.gamesPlayed} | Points: ${whichTeam.points} | Record: ${whichTeam.leagueRecord.wins}-${whichTeam.leagueRecord.losses}-${whichTeam.leagueRecord.ot} | Goal Dif: ${goalDif} | Streak: ${whichTeam.streak.streakCode}`,
    });
  }

  return embed;
}

export function getWildcardStandingsEmbed(data: any, conference: number): EmbedBuilder {
  const embed = new EmbedBuilder();

  const whichConference = data.records[conference];
  const conferenceName = whichConference.conference.name;

  embed.setTitle(`NHL Standings: ${conferenceName} Wild Cards`);
  embed.setColor("NotQuiteBlack");

  for (let i = 0; whichConference.teamRecords.length; i++) {
    const whichTeam = whichConference.teamRecords[i];
    const teamName = whichTeam.team.name;

    const goalDif = whichTeam.goalsScored - whichTeam.goalsAgainst;

    let fieldName: string;
    if (whichTeam.wildCardRank == "1" || whichTeam.wildCardRank == "2") {
      fieldName = `${whichTeam.wildCardRank}) ${teamName} *`;
    } else {
      fieldName = `${whichTeam.wildCardRank}) ${teamName}`;
    }

    embed.addFields({
      name: fieldName,
      value: `GP: ${whichTeam.gamesPlayed} | Points: ${whichTeam.points} | Record: ${whichTeam.leagueRecord.wins}-${whichTeam.leagueRecord.losses}-${whichTeam.leagueRecord.ot} | Goal Dif: ${goalDif} | Streak: ${whichTeam.streak.streakCode}`,
    });
  }

  return embed;
}

export function getLeagueStandingsEmbed(data: any, part: number): EmbedBuilder {
  const embed = new EmbedBuilder();

  const whichLeague = data.records[0];

  embed.setTitle(`NHL Standings: League Part ${part}`);
  embed.setColor("NotQuiteBlack");

  // Which half of the league to output
  let startTeam: number;
  let endTeam: number;
  if (part == 1) {
    startTeam = 0;
    endTeam = Math.floor(whichLeague.teamRecords.length / 2);
  } else {
    startTeam = Math.floor(whichLeague.teamRecords.length / 2);
    endTeam = whichLeague.teamRecords.length;
  }

  for (let i = startTeam; i < endTeam; i++) {
    const whichTeam = whichLeague.teamRecords[i];
    const teamName = whichTeam.team.name;

    const goalDif = whichTeam.goalsScored - whichTeam.goalsAgainst;

    embed.addFields({
      name: `${whichTeam.leagueRank}) ${teamName}`,
      value: `GP: ${whichTeam.gamesPlayed} | Points: ${whichTeam.points} | Record: ${whichTeam.leagueRecord.wins}-${whichTeam.leagueRecord.losses}-${whichTeam.leagueRecord.ot} | Goal Dif: ${goalDif} | Streak: ${whichTeam.streak.streakCode}`,
    });
  }

  return embed;
}
