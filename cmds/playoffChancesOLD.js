const request = require("request");
const teamName = require("../helpers/teamNames.js");

module.exports.run = async (client, message, args) => {
  let a = ``;
  if (args.length > 0) {
    a = `${args[0]}`;
  }
  for (i = 1; i < args.length; i++) {
    a = `${a} ${args[i]}`;
  }
  var team = teamName.getTeamNameFromAbrev(a);
  if (team == -1) {
    message.channel.send("Team not found!");
  } else {
    request(
      {
        url:
          "http://www.sportsclubstats.com/d/NHL_ChanceWillMakePlayoffs_Small_D.json",
        json: true
      },
      (err, response, data) => {
        const standings =
          data.data.filter(d => d.label === team)[0] || null;
        message.channel.send(
          `The ${team} have a ${
            standings.data[standings.data.length - 1]
          }% chance of making the playoffs`
        );
      }
    );
  }
};

module.exports.help = {
  name: "chanceOLD"
};
