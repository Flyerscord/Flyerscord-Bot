const Discord = require("discord.js");
const request = require("request");
const config = require("../config.json");

module.exports.run = async (client, message, args) => {
  const d = new Date();

  var nextYear = d.getFullYear() + 1;
  var currentMonth = d.getMonth() + 1;

  var nextDate = d.getDate();
  if (currentMonth == 2 && nextDate == 29) {
    nextDate = 28;
  }

  var startDate = d.getFullYear() + "-" + currentMonth + "-" + d.getDate();
  var endDate = nextYear + "-" + currentMonth + "-" + nextDate;

  
  var url = "https://statsapi.web.nhl.com/api/v1/schedule?teamId=4&startDate=" + startDate + "&endDate=" + endDate;
  const embed = new Discord.RichEmbed();
  
  var gamesToPrint;
  
  if (args[0]) {
    var arg = parseInt(args[0], 10);
    if (!isNaN(arg)) {
      if (args[0] > 25) {
        message.channel.send("Must be less than or equal to 25 games");
        gamesToPrint = 25;
      } else {
        gamesToPrint = args[0];
      }
    } else {
      message.channel.send("ERROR: Format is \"" + config.prefix + "schedule [number]\".  Default is 5.");
      gamesToPrint = 0;
    }
  } else {
    gamesToPrint = 5;
  }
  //console.log("Games: " + gamesToPrint);
  
  if (gamesToPrint > 0) {
    request({url: url, json: true }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let string = JSON.stringify(body);
        var obj = JSON.parse(string);

        if (gamesToPrint == 1) {
          embed.setTitle("Next upcoming Flyers game");
        } else {
          embed.setTitle("Next " + Math.ceil(gamesToPrint) + " upcoming Flyers games");
        }

        if (obj.dates.length >= gamesToPrint) {
          // There are more than the configured upcoming games
          for (var i = 0; i < gamesToPrint; i++) {
            var game = obj.dates[i].games[0];
            var date = game.gameDate;

            var d = new Date(date);

            var gameMonth = d.getMonth() + 1;
            var gameHour = d.getHours();
            var gameMinute = d.getMinutes();
            var gameDay = d.getDate();

            if (gameHour < 0) {
              gameDay--;
              gameHour = 24 + gameHour;
            }

            var gameAmPm = gameHour >= 12 ? 'PM' : 'AM';

            gameHour = gameHour % 12;
            gameHour = gameHour ? gameHour : 12; // the hour '0' should be '12'
            gameMinute = gameMinute < 10 ? '0'+gameMinute : gameMinute;
            var gameTime = gameHour + ':' + gameMinute + ' ' + gameAmPm;

            var gameDate = gameMonth + "/" + gameDay + "/" + d.getFullYear() + "   " + gameTime;

            var awayTeam = game.teams.away.team.name;
            var homeTeam = game.teams.home.team.name;

            embed.addField(gameDate, awayTeam + " @ " + homeTeam);
          }
        } else {
          // There are less than the specified upcoming games
          for (var i = 0; i < obj.dates.length; i++) {
            var game = obj.dates[i].games[0];
            var date = game.gameDate;

            var d = new Date(date);

            var gameMonth = d.getMonth() + 1;
            var gameHour = d.getHours() - 5;
            var gameMinute = d.getMinutes();
            var gameDay = d.getDate();

            if (gameHour < 0) {
              gameDay--;
              gameHour = 24 + gameHour;
            }

            var gameAmPm = gameHour >= 12 ? 'PM' : 'AM';

            gameHour = gameHour % 12;
            gameHour = gameHour ? gameHour : 12; // the hour '0' should be '12'
            gameMinute = gameMinute < 10 ? '0'+gameMinute : gameMinute;
            var gameTime = gameHour + ':' + gameMinute + ' ' + gameAmPm;

            var gameDate = gameMonth + "/" + gameDay + "/" + d.getFullYear() + "   " + gameTime;

            var awayTeam = game.teams.away.team.name;
            var homeTeam = game.teams.home.team.name;



            embed.addField(gameDate, awayTeam + " @ " + homeTeam);
          }
        }

        embed.setFooter("Type " + config.prefix +"help to view commands");
        embed.setColor(0xf74902);
        message.channel.send({embed});
      } else {
        console.error("Error with API request");
      }
    });
  }
}
  
module.exports.help = {
  name: "schedule"
}