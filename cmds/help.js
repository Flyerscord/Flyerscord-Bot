const Discord = require("discord.js");
const config = require("../lib/common/config.js");

var prefix = config.prefix;

module.exports.run = async (client, message, args) => {
  message.channel.send({
    embed: {
      color: 16711680,
      title: "NHL Bot Help",
      fields: [
        {
          name: prefix + "schedule [number of games]",
          value: "Prints up to the next specified number of Flyers games.  The default is 5.",
        },
        {
          name: prefix + "standings help",
          value: "Prints the help information for the standings command.",
        },
        {
          name: prefix + "career [player's full name]",
          value: "Prints a players career stats.",
        },
        {
          name: prefix + "season [player's full name]",
          value: "Prints a players stats for the current season.",
        },
        {
          name: prefix + "chance [team name]",
          value: "Prints a team's chance at making the playoffs.",
        },
      ],
    },
  });
};

module.exports.help = {
  name: "help",
};
