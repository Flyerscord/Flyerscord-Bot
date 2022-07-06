const moment = require("moment");
const logging = require("../lib/common/logging.js");

module.exports.run = async (client, message, args) => {
  var startDate = moment();
  var endDate = moment("2022-7-7 19:00:00", "YYYY-M-DD HH:mm:ss");
  var secondsDiff = endDate.diff(startDate, "seconds");

  const type = "2022 NHL Draft";
  // logging.logDebug(secondsDiff, "daysLeft");

  if (secondsDiff <= 0) {
    message.channel.send(`The **${type}** has started!`);
  } else {
    const secondsInDay = 60 * 60 * 24;
    const secondsInHour = 60 * 60;
    const secondsInMinute = 60;

    var remainder = 0;
    var days = 0;
    var hours = 0;
    var minutes = 0;
    var seconds = 0;

    var stringHeader = `The **${type}** starts in`;

    days = Math.floor(secondsDiff / secondsInDay);
    remainder = secondsDiff - days * secondsInDay;

    hours = Math.floor(remainder / secondsInHour);
    remainder = remainder - hours * secondsInHour;

    minutes = Math.floor(remainder / secondsInMinute);
    seconds = remainder - minutes * secondsInMinute;

    if (days > 0) {
      message.channel.send(`${stringHeader} ${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds!`);
    } else {
      if (hours > 0) {
        message.channel.send(`${stringHeader} ${hours} hours, ${minutes} minutes, and ${seconds} seconds!`);
      } else {
        if (minutes > 0) {
          message.channel.send(`${stringHeader} ${minutes} minutes and ${seconds} seconds!`);
        } else {
          message.channel.send(`${stringHeader} ${seconds} seconds!`);
        }
      }
    }
  }
};

module.exports.help = {
  name: "draftTime",
};
