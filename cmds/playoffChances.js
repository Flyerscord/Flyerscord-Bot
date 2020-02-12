module.exports.run = async (client, message, args) => {
  request(
    {
      url:
        "http://www.sportsclubstats.com/d/NHL_ChanceWillMakePlayoffs_Small_D.json",
      json: true
    },
    (err, response, data) => {
      const standings =
        data.data.filter(d => d.label === teamObj.name)[0] || null;
      message.channel.send(
        standings
          ? `The ${teamObj.name} have a ${
              standings.data[standings.data.length - 1]
            } percent chance of making the postseason`
          : "Error finding team by abbreviation"
      );
    }
  );
};

module.exports.help = {
  name: "chance"
};
