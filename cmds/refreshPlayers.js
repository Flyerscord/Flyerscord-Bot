const request = require("request");
const fs = require("fs");
const discord = require("discord.js");

const logging = require("../lib/common/logging.js");

module.exports.run = async (client, message, args) => {
  var url = "https://statsapi.web.nhl.com/api/v1/teams?expand=team.roster";

  logging.logEvent("Running Player Refresh...", "refreshPlayers");
  request({ url: url, json: true }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var jsonObj = {};
      let string = JSON.stringify(body);
      var obj = JSON.parse(string);

      for (var i = 0; i < obj.teams.length; i++) {
        var team = obj.teams[i];
        var roster = team.roster.roster;
        for (var j = 0; j < roster.length; j++) {
          var player = roster[j].person;
          var pid = player.id;
          var name = player.fullName;
          // logging.logDebug(`Player: ${name}  PID: ${pid}`, "refreshPlayers");
          jsonObj[name] = pid;
        }
      }
      var json = JSON.stringify(jsonObj);
      fs.writeFile(
        "../team_info/player_ids.json",
        json,
        "utf8",
        function (err) {
          if (err) throw err;
          message.channel.send("Players updated!");
        }
      );
    }
  });
  logging.logEvent("Done running player refresh!", "refreshPlayers");
};

module.exports.help = {
  name: "refreshPlayers",
};
