const Discord = require("discord.js");
const request = require("request");
const config = require("../config.json");
const logging = require("../lib/common/logging.js");

var prefix = config.prefix;

module.exports.run = async (client, message, args) => {
  var url;
  var embed = new Discord.MessageEmbed();

  var divisionNum;
  var conferenceNum;
  var cardDiv1Num;
  var cardDiv2Num;
  var cardWildNum;
  var type;

  switch (args[0]) {
    case "div":
    case "division":
    case "Div":
    case "Division":
    case "d":
    case "D":
      type = "d";
      switch (args[1]) {
        case "metro":
        case "metropolitan":
        case "Metropolitan":
        case "Metro":
          divisionNum = 0;
          break;

        case "Atlantic":
        case "atlantic":
        case "atl":
        case "Atl":
          divisionNum = 1;
          break;

        case "Central":
        case "central":
        case "cen":
        case "Cen":
          divisionNum = 2;
          break;

        case "Pacific":
        case "pacific":
        case "pac":
        case "Pac":
          divisionNum = 3;
          break;

        default:
          divisionNum = 0;
          break;
      }
      url = "https://statsapi.web.nhl.com/api/v1/standings/byDivision";
      break;

    case "conf":
    case "conference":
    case "Conf":
    case "Conference":
    case "C":
    case "c":
      type = "c";
      url = "https://statsapi.web.nhl.com/api/v1/standings/byConference";
      switch (args[1]) {
        case "east":
        case "East":
        case "e":
        case "E":
          conferenceNum = 0;
          break;
        case "west":
        case "West":
        case "w":
        case "W":
          conferenceNum = 1;
          break;
        default:
          conferenceNum = 0;
          break;
      }
      break;

    case "league":
    case "League":
    case "l":
    case "L":
      type = "l";
      url = "https://statsapi.web.nhl.com/api/v1/standings/byLeague";
      break;
    case "wild":
    case "Wild":
    case "w":
    case "W":
    case "wildcard":
    case "Wildcard":
    case "WildCard":
    case "wildCard":
      type = "w";
      url = "https://statsapi.web.nhl.com/api/v1/standings/wildCardWithLeaders";
      switch (args[1]) {
        case "east":
        case "East":
        case "e":
        case "E":
          cardDiv1Num = 2;
          cardDiv2Num = 3;
          cardWildNum = 0;
          break;
        case "west":
        case "West":
        case "w":
        case "W":
          cardDiv1Num = 4;
          cardDiv2Num = 5;
          cardWildNum = 1;
          break;
        default:
          cardDiv1Num = 2;
          cardDiv2Num = 3;
          cardWildNum = 0;
          break;
      }
      break;
    case "Help":
    case "help":
      message.channel.send({
        embed: {
          color: 16711680,
          title: "NHL Standings: Command Help",
          fields: [
            {
              name: prefix + "standings div [division name]",
              value:
                "Prints the standings for the specified division. Defaults to the Metro.",
            },
            {
              name: prefix + "standings conf [conference name]",
              value:
                "Prints the standings for the specified conference. Defaults to the East.",
            },
            {
              name: prefix + "standings league",
              value: "Prints the standings for the league.",
            },
            {
              name: prefix + "standings wild [conference name]",
              value:
                "Prints a the divsion leader and the wild cards for the specified conference.  Defaults to the East.",
            },
          ],
        },
      });
      break;
    default:
      message.channel.send("Must enter standing type d, c, l, w, or help");
      return;
  }

  // Division
  if (type == "d") {
    request({ url: url, json: true }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let string = JSON.stringify(body);
        var obj = JSON.parse(string);

        var whichDivision = obj.records[divisionNum];
        var divisionName = whichDivision.division.name;

        embed.setTitle("NHL Standings: " + divisionName);

        // Cycles through the teams in the division
        for (var j = 0; j < whichDivision.teamRecords.length; j++) {
          var whichTeam = whichDivision.teamRecords[j];
          var teamName = whichTeam.team.name;

          var goalDif = whichTeam.goalsScored - whichTeam.goalsAgainst;
          embed.addField(
            whichTeam.divisionRank + ") " + teamName,
            "GP: " +
              whichTeam.gamesPlayed +
              " | Points: " +
              whichTeam.points +
              " | Record: " +
              whichTeam.leagueRecord.wins +
              "-" +
              whichTeam.leagueRecord.losses +
              "-" +
              whichTeam.leagueRecord.ot +
              " | Goal Dif: " +
              goalDif +
              " | Streak: " +
              whichTeam.streak.streakCode
          );
        }
        embed.setColor(0x000000);
        embed.setFooter("Type " + config.prefix + "help to view commands");

        message.channel.send({ embed });
      }
    });
  }
  // Conference
  else if (type == "c") {
    request({ url: url, json: true }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let string = JSON.stringify(body);
        var obj = JSON.parse(string);

        var whichConference = obj.records[conferenceNum];
        var conferenceName = whichConference.conference.name;

        embed.setTitle("NHL Standings: " + conferenceName);

        // Cycles through the teams in the conference
        for (var j = 0; j < whichConference.teamRecords.length; j++) {
          var whichTeam = whichConference.teamRecords[j];
          var teamName = whichTeam.team.name;

          var goalDif = whichTeam.goalsScored - whichTeam.goalsAgainst;
          embed.addField(
            whichTeam.conferenceRank + ") " + teamName,
            "GP: " +
              whichTeam.gamesPlayed +
              " | Points: " +
              whichTeam.points +
              " | Record: " +
              whichTeam.leagueRecord.wins +
              "-" +
              whichTeam.leagueRecord.losses +
              "-" +
              whichTeam.leagueRecord.ot +
              " | Goal Dif: " +
              goalDif +
              " | Streak: " +
              whichTeam.streak.streakCode
          );
        }
        embed.setColor(0x000000);
        embed.setFooter("Type " + config.prefix + "help to view commands");

        message.channel.send({ embed });
      }
    });
  }
  // League
  else if (type == "l") {
    request({ url: url, json: true }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let string = JSON.stringify(body);
        var obj = JSON.parse(string);

        var whichLeague = obj.records[0];

        embed.setTitle("NHL Standings: League Part 1");

        // Cycles through the teams in the first half of the league
        var i;
        for (i = 0; i < whichLeague.teamRecords.length / 2; i++) {
          var whichTeam = whichLeague.teamRecords[i];
          var teamName = whichTeam.team.name;

          var goalDif = whichTeam.goalsScored - whichTeam.goalsAgainst;
          embed.addField(
            whichTeam.leagueRank + ") " + teamName,
            "GP: " +
              whichTeam.gamesPlayed +
              " | Points: " +
              whichTeam.points +
              " | Record: " +
              whichTeam.leagueRecord.wins +
              "-" +
              whichTeam.leagueRecord.losses +
              "-" +
              whichTeam.leagueRecord.ot +
              " | Goal Dif: " +
              goalDif +
              " | Streak: " +
              whichTeam.streak.streakCode
          );
        }
        embed.setColor(0x000000);
        embed.setFooter("Type " + config.prefix + "help to view commands");

        message.channel.send({ embed });

        embed = new Discord.MessageEmbed();
        embed.setTitle("NHL Standings: League Part 2");

        // Cycles through the teams in the second half of the league
        for (var j = i; j < whichLeague.teamRecords.length; j++) {
          var whichTeam = whichLeague.teamRecords[j];
          var teamName = whichTeam.team.name;

          var goalDif = whichTeam.goalsScored - whichTeam.goalsAgainst;
          embed.addField(
            whichTeam.leagueRank + ") " + teamName,
            "GP: " +
              whichTeam.gamesPlayed +
              " | Points: " +
              whichTeam.points +
              " | Record: " +
              whichTeam.leagueRecord.wins +
              "-" +
              whichTeam.leagueRecord.losses +
              "-" +
              whichTeam.leagueRecord.ot +
              " | Goal Dif: " +
              goalDif +
              " | Streak: " +
              whichTeam.streak.streakCode
          );
        }
        embed.setColor(0x000000);
        embed.setFooter("Type " + config.prefix + "help to view commands");

        message.channel.send({ embed });
      }
    });
  }
  // Wildcard
  else if (type == "w") {
    request({ url: url, json: true }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let string = JSON.stringify(body);
        var obj = JSON.parse(string);
        var whichObj;

        // First Div Leaders
        whichObj = obj.records[cardDiv1Num];
        var divisionName = whichObj.division.name;
        embed.setTitle("NHL Standings: " + divisionName + " Leaders");
        for (var j = 0; j < whichObj.teamRecords.length; j++) {
          var whichTeam = whichObj.teamRecords[j];
          var teamName = whichTeam.team.name;

          var goalDif = whichTeam.goalsScored - whichTeam.goalsAgainst;
          embed.addField(
            whichTeam.divisionRank + ") " + teamName,
            "GP: " +
              whichTeam.gamesPlayed +
              " | Points: " +
              whichTeam.points +
              " | Record: " +
              whichTeam.leagueRecord.wins +
              "-" +
              whichTeam.leagueRecord.losses +
              "-" +
              whichTeam.leagueRecord.ot +
              " | Goal Dif: " +
              goalDif +
              " | Streak: " +
              whichTeam.streak.streakCode
          );
        }

        embed.setColor(0x000000);
        embed.setFooter("Type " + config.prefix + "help to view commands");

        message.channel.send({ embed });

        embed = new Discord.MessageEmbed();

        // Second Div Leaders
        whichObj = obj.records[cardDiv2Num];
        var divisionName = whichObj.division.name;
        embed.setTitle("NHL Standings: " + divisionName + " Leaders");
        for (var j = 0; j < whichObj.teamRecords.length; j++) {
          var whichTeam = whichObj.teamRecords[j];
          var teamName = whichTeam.team.name;

          var goalDif = whichTeam.goalsScored - whichTeam.goalsAgainst;
          embed.addField(
            whichTeam.divisionRank + ") " + teamName,
            "GP: " +
              whichTeam.gamesPlayed +
              " | Points: " +
              whichTeam.points +
              " | Record: " +
              whichTeam.leagueRecord.wins +
              "-" +
              whichTeam.leagueRecord.losses +
              "-" +
              whichTeam.leagueRecord.ot +
              " | Goal Dif: " +
              goalDif +
              " | Streak: " +
              whichTeam.streak.streakCode
          );
        }

        embed.setColor(0x000000);
        embed.setFooter("Type " + config.prefix + "help to view commands");

        message.channel.send({ embed });

        embed = new Discord.MessageEmbed();

        // Conference Wild cards
        whichObj = obj.records[cardWildNum];
        var conferenceName = whichObj.conference.name;
        embed.setTitle("NHL Standings: " + conferenceName + " Wild Cards");
        for (var j = 0; j < whichObj.teamRecords.length; j++) {
          var whichTeam = whichObj.teamRecords[j];
          var teamName = whichTeam.team.name;

          var goalDif = whichTeam.goalsScored - whichTeam.goalsAgainst;
          if (whichTeam.wildCardRank == "1" || whichTeam.wildCardRank == "2") {
            embed.addField(
              whichTeam.wildCardRank + ") " + teamName + " *",
              "GP: " +
                whichTeam.gamesPlayed +
                " | Points: " +
                whichTeam.points +
                " | Record: " +
                whichTeam.leagueRecord.wins +
                "-" +
                whichTeam.leagueRecord.losses +
                "-" +
                whichTeam.leagueRecord.ot +
                " | Goal Dif: " +
                goalDif +
                " | Streak: " +
                whichTeam.streak.streakCode
            );
          } else {
            embed.addField(
              whichTeam.wildCardRank + ") " + teamName,
              "GP: " +
                whichTeam.gamesPlayed +
                " | Points: " +
                whichTeam.points +
                " | Record: " +
                whichTeam.leagueRecord.wins +
                "-" +
                whichTeam.leagueRecord.losses +
                "-" +
                whichTeam.leagueRecord.ot +
                " | Goal Dif: " +
                goalDif +
                " | Streak: " +
                whichTeam.streak.streakCode
            );
          }
        }

        embed.setColor(0x000000);
        embed.setFooter("Type " + config.prefix + "help to view commands");

        message.channel.send({ embed });
      }
    });
  }
  // Error
  else {
    logging.logError("Type kof standing was not defined", "standings");
    return;
  }
};

module.exports.help = {
  name: "standings",
};
