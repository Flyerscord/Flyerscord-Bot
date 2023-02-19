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

export function getScheduleEmbed(data: any, gamesToPrint: number): EmbedBuilder {
  const embed = new EmbedBuilder();

  gamesToPrint = Math.ceil(gamesToPrint);

  if (gamesToPrint == 1) {
    embed.setTitle("Next Upcoming Flyers Game");
  } else {
    embed.setTitle(`Next ${gamesToPrint} Upcoming Flyers Games`);
  }

  embed.setColor(0xf74902);

  let numGames: number;
  if (data.dates.length >= gamesToPrint) {
    numGames = gamesToPrint;
  } else {
    numGames = data.dates.length;
  }

  for (let i = 0; i < numGames; i++) {
    const game = data.dates[i].games[0];
    const date = game.gameDate;

    const d = new Date(date);

    const gameMonth = d.getMonth() + 1;
    let gameHour = d.getHours();
    const gameMinute = d.getMinutes();
    let gameDay = d.getDate();

    if (gameHour < 0) {
      gameDay--;
      gameHour = 24 + gameHour;
    }

    const gameAmPm = gameHour >= 12 ? "PM" : "AM";

    gameHour = gameHour % 12;
    gameHour = gameHour ? gameHour : 12; // the hour '0' should be '12'
    const gameMinutePadded = gameMinute < 10 ? "0" + gameMinute : gameMinute;
    const gameTime = `${gameHour}:${gameMinutePadded} ${gameAmPm}`;

    const gameDate = `${gameMonth}/${gameDay}/${d.getFullYear()}   ${gameTime}`;

    const awayTeam = game.teams.away.team.name;
    const homeTeam = game.teams.home.team.name;

    embed.addFields({ name: gameDate, value: `${awayTeam} @ ${homeTeam}` });
  }

  return embed;
}
