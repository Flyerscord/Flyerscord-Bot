const request = require("request");

module.exports.run = async (client, message, args) => {
  if (
    message.channel.id == 413248253522345984 ||
    message.channel.id == 345701810616532993
  ) {
    message.delete();
    var url = "https://statsapi.web.nhl.com/api/v1/teams/4?expand=team.roster";

    request({ url: url, json: true }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let string = JSON.stringify(body);
        var obj = JSON.parse(string);
        var roster = obj.teams[0].roster.roster;
        roster.forEach((player) => {
          let playerFullName = player.person.fullName;
          let playerNameArray = playerFullName.split(" ");
          let playerLastName = playerNameArray[playerNameArray.length - 1];

          let playerId = player.person.id;

          let photoUrl = `https://cms.nhl.bamgrid.com/images/headshots/current/168x168/${playerId}.png`;
          message.guild.emojis
            .create(photoUrl, playerLastName)
            .then((emoji) =>
              console.log(`Created new emoji with name ${emoji.name}!`)
            )
            .catch((err) => {
              console.log(`Failed player: ${playerFullName}  id: ${playerId}`);
              console.error(err);
            });
        });
      }
    });
  }
};

module.exports.help = {
  name: "createPlayerEmojis",
};
