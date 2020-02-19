const moment = require("moment");

module.exports.run = (client, message, args) => {
  var startDate = moment();
  var endDate = moment("2020-2-24 15:00:00", "YYYY-M-DD HH:mm:ss");
  var secondsDiff = endDate.diff(startDate, "seconds");
  //   console.log(secondsDiff);

  if (secondsDiff <= 0) {
    message.channel.send("The **NHL Trade Deadline** has passed.");
  } else {
    const secondsInDay = 60 * 60 * 24;
    const secondsInHour = 60 * 60;
    const secondsInMinute = 60;

    var remainder = 0;
    var days = 0;
    var hours = 0;
    var minutes = 0;
    var seconds = 0;

    days = Math.floor(secondsDiff / secondsInDay);
    remainder = secondsDiff - days * secondsInDay;

    hours = Math.floor(remainder / secondsInHour);
    remainder = remainder - hours * secondsInHour;

    minutes = Math.floor(remainder / secondsInMinute);
    seconds = remainder - minutes * secondsInMinute;

    // console.log(days);
    // console.log(hours);
    // console.log(minutes);
    // console.log(seconds);

    if (days > 0) {
      message.channel.send(`The **NHL Trade Deadline** is in ${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds!`);
    } else {
      if (hours > 0) {
        message.channel.send(`The **NHL Trade Deadline** is in ${hours} hours, ${minutes} minutes, and ${seconds} seconds!`);
      } else {
        if (minutes > 0) {
          message.channel.send(`The **NHL Trade Deadline** is in ${minutes} minutes and ${seconds} seconds!`);
        } else {
          message.channel.send(`The **NHL Trade Deadline** is in ${seconds} seconds!`);
        }
      }
    }
  }
};

module.exports.help = {
  name: "deadline"
};
