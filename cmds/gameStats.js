const request = require("request");
const Discord = require("discord.js");
const config = require("../config.json");
const game = require("../json_classes/game.js");

module.exports.run = (client, message, args) => {
  url = "https://statsapi.web.nhl.com/api/v1/game/2018020001/feed/live";

  request({ url: url, json: true }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var gameObj = game.gameToJson(body);

      message.channel.send({
        embed: {
          color: 16711680,
          title: "NHL Bot Help",
          fields: [
            {
              name: prefix + "schedule [number of games]",
              value: "Prints up to the next specified number of Flyers games.  The default is 5."
            },
            {
              name: prefix + "standings help",
              value: "Prints the help information for the standings command."
            },
            {
              name: prefix + "career [player's full name]",
              value: "Prints a players career stats."
            },
            {
              name: prefix + "season [player's full name]",
              value: "Prints a players stats for the current season."
            }
          ]
        }
      });
    }
  });
}

module.exports.help = {
  name: "gamestats"
}