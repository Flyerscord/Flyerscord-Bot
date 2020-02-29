const http = require("http");
const fs = require("fs");
const csv = require("csv-parser");

const teamNames = require("../helpers/teamNames.js");
const results = [];

var msg = null;

module.exports.run = async (client, message, args) => {
  msg = message;
  const date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth();
  var day = date.getDate();

  let a = ``;
  if (args.length > 0) {
    a = `${args[0]}`;
  }
  for (i = 1; i < args.length; i++) {
    a = `${a} ${args[i]}`;
  }

  var teamTag = teamNames.getTeamTagFromAbrev(a);
  var teamName = teamNames.getTeamNameFromAbrev(a);
  var fileName = `chance-files/chances-${month}-${day}-${year}.csv`;

  if (teamTag == -1) {
    message.channel.send("Team not found!");
  } else {
    if (!fs.existsSync(fileName)) {
      const file = fs.createWriteStream(fileName);

      http.get(
        "http://moneypuck.com/moneypuck/simulations/playoff_graph.csv",
        response => {
          response.pipe(file);
          file.on("finish", function() {
            file.close();
            readFile(fileName, teamTag, teamName);
          });
        }
      );
    } else {
      readFile(fileName, teamTag, teamName);
    }
  }
};

function readFile(fileName, teamTag, teamName) {
  fs.createReadStream(fileName)
    .pipe(csv())
    .on("data", data => results.push(data))
    .on("end", () => {
      var chance = results[results.length - 1][teamTag] * 100;
      chance = chance.toFixed(2);
      msg.channel.send(
        `The ${teamName} have a ${chance}% chance of making the playoffs!`
      );
    });
}

module.exports.help = {
  name: "chance"
};
