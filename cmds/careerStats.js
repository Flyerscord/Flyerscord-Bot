const request = require("request");
const playerIds = require("../team_info/player_ids.json");
const config = require("../config.json");

module.exports.run = (client, message, args) => {
  if (args.length == 0) {
    message.channel.send("You need to give a player's first and last name! It is caps sensitive!");
  } else {
    //args[0] = args[0].toLowerCase();
  }
  
  var fullName = "";
  for (var i = 0; i < args.length; i++) {
     if (i == args.length - 1) {
       fullName = fullName + args[i]; 
     } else {
       fullName = fullName + args[i] + " "; 
     }
  }
  //console.log(fullName);
  var url = "https://statsapi.web.nhl.com/api/v1/people/" + playerIds[fullName] + "/stats?stats=careerRegularSeason";
  var playerUrl = "https://statsapi.web.nhl.com/api/v1/people/" + playerIds[fullName];

  var playerType;

  request({url: playerUrl, json: true }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      let string = JSON.stringify(body);
      var obj = JSON.parse(string);
      
      playerType = obj.people[0].primaryPosition.type;
    }
  });

  request({url: url, json: true }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      let string = JSON.stringify(body);
      var obj = JSON.parse(string);
      obj = obj.stats[0].splits[0].stat;
      
      if (playerType === "Goalie") {
        message.channel.send({embed: {
          color: 16206082,
          title: fullName + "'s Career Regular Season Statistics",
          fields: [
            {
              name: "Games played:",
              value: obj.games
            },
            {
              name: "Starts:",
              value: obj.gamesStarted
            },
            {
              name: "Record:",
              value: obj.wins + "-" + obj.losses + "-" + obj.ot
            },
            {
              name: "Save Percentage:",
              value: obj.savePercentage + " "
            },
            {
              name: "GAA:",
              value: obj.goalAgainstAverage + " "
            },
            {
              name: "PP Save Percentage:",
              value: obj.powerPlaySavePercentage + "%"
            },
            {
              name: "Even Strength Save Percentage:",
              value: obj.evenStrengthSavePercentage + "%"
            },
            {
              name: "Saves:",
              value: obj.saves
            },
          ],
          footer: {
            text: "Type " + config.prefix +"help to view commands"
          }
        }});
      } else {
        message.channel.send({embed: {
          color: 16206082,
          title: fullName + "'s Career Regular Season Statistics",
          fields: [
            {
              name: "Games played:",
              value: obj.games
            },
            {
              name: "Goals:",
              value: obj.goals
            },
            {
              name: "Assists:",
              value: obj.assists
            },
            {
              name: "Points:",
              value: obj.points
            },
            {
              name: "Penalty Minutes:",
              value: obj.penaltyMinutes
            },
            {
              name: "Shots:",
              value: obj.shots
            },
            {
              name: "Shifts:",
              value: obj.shifts
            }
          ],
          footer: {
            text: "Type " + config.prefix +"help to view commands"
          }
        }});
      }
    } else {
      message.channel.send("Incorrect name!");
    }
  });
}
  
module.exports.help = {
  name: "career"
}