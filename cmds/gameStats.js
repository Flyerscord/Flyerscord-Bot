const request = require("request");
const Discord = require("discord.js");
const teamInfo = require("../helpers/teamInfo.js");

module.exports.run = async (client, message, args) => {
  url = "https://statsapi.web.nhl.com/api/v1/game/2018020004/boxscore";

  request({ url: url, json: true }, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      let bodyStr = JSON.stringify(body);
      var obj = JSON.parse(bodyStr);

      var homeTeamName = obj.teams.home.team.name;
      var awayTeamName = obj.teams.away.team.name;

      var homeStats = obj.teams.home.teamStats.teamSkaterStats;
      var awayStats = obj.teams.away.teamStats.teamSkaterStats;

      var homeEmoji = client.emojis.find(
        emoji => emoji.name === teamInfo.getEmoji(homeTeamName)
      );
      var awayEmoji = client.emojis.find(
        emoji => emoji.name === teamInfo.getEmoji(awayTeamName)
      );

      // Check who won
      if (homeStats.goals > awayStats.goals) {
        var winner = homeTeamName;
      } else {
        var winner = awayTeamName;
      }

      message.channel.send({
        embed: {
          color: teamInfo.getHomeColor(winner),
          title: `${awayEmoji} ${awayTeamName} @ ${homeEmoji} ${homeTeamName}`,
          thumbnail: {
            url: teamInfo.getLogo(winner)
          },
          fields: [
            {
              name: awayTeamName,
              value: getStats(awayStats),
              inline: true
            },
            {
              name: homeTeamName,
              value: getStats(homeStats),
              inline: true
            }
          ]
        }
      });
    }
  });
};

function getStats(stats) {
  let formattedStats = `**Goals:** ${stats.goals}
  **Shots:** ${stats.shots}

  **Shots Blocked:** ${stats.blocked}
  **Give Aways:** ${stats.giveaways}
  **PP%:** ${stats.powerPlayPercentage}
  **FOW%:** ${stats.faceOffWinPercentage}
  **PIM:** ${stats.pim}
  **Hits:** ${stats.hits}`;
  return formattedStats;
}

module.exports.help = {
  name: "gs"
};
