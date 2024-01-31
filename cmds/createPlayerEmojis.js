const request = require("request");

module.exports.run = async (client, message, args) => {
  if (
    message.channel.id == 413248253522345984 ||
    message.channel.id == 345701810616532993
  ) {
    message.delete();
    var url = "https://api-web.nhle.com/v1/roster/PHI/current";

    request({ url: url, json: true }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let string = JSON.stringify(body);
        var obj = JSON.parse(string);

        const allPlayers = [...obj.forwards, ...obj.defensemen, ...obj.goalies];
        allPlayers.forEach((player) => {
          const playerLastName = player.lastName.default;

          let photoUrl = player.headshot;
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
