const globals = require("../helpers/globals");

module.exports.run = async (client, message, args) => {
  clearInterval(globals.timer);
  message.channel.send("The test has been stopped!");
};

module.exports.help = {
  name: "stopTest",
};
