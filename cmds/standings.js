const Discord = require("discord.js");
const request = require("request");
const config = require("../config.json");

module.exports.run = (client, message, args) => {
  var url = "https://statsapi.web.nhl.com/api/v1/standings/byDivision";
  const embed = new Discord.RichEmbed();

  request({url: url, json: true }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      let string = JSON.stringify(body);
      var obj = JSON.parse(string);

      var divisionNum;

      switch (args[0]) {
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

      var whichDivision = obj.records[divisionNum];
      var divisionName = whichDivision.division.name;

      embed.setTitle("NHL Standings: " + divisionName);

      // Cycles through the teams in the division
      for (var j = 0; j < whichDivision.teamRecords.length; j++) {
        var whichTeam = whichDivision.teamRecords[j];
        var teamName = whichTeam.team.name;
  
        var goalDif = whichTeam.goalsScored - whichTeam.goalsAgainst;
        embed.addField(teamName, "GP: " + whichTeam.gamesPlayed + " | Points: " + whichTeam.points + " | Record: " + whichTeam.leagueRecord.wins + "-" + whichTeam.leagueRecord.losses + "-" + whichTeam.leagueRecord.ot + " | Goal Dif: " + goalDif + " | Streak: " + whichTeam.streak.streakCode);
      }

      embed.setColor(0x000000);
      embed.setFooter("Type " + config.prefix +"help to view commands");

      message.channel.send({embed});
    }
  });
}
  
module.exports.help = {
  name: "standings"
}