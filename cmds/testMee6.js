const globals = require("../helpers/globals");

module.exports.run = async (client, message, args) => {
  if (
    message.channel.id == 345701810616532993 ||
    message.channel.id == 495745156163698688
  ) {
    message.delete();
    if (args.length == 0) return;
    var all = args.join("");
    let descriptionRegex = /^[A-Za-z0-9].+$/gm;
    all = all.replace(descriptionRegex, "");
    let emptyLineRegex = /^\n/gm;
    all = all.replace(emptyLineRegex, "");

    var lines = all.split("\n");
    var index = 0;
    globals.timer = setInterval(() => {
      if (index == lines.length) {
        clearInterval(globals.timer);
      }
      message.channel.send(lines[index]);
      index++;
    }, 5000);
  }
};

module.exports.help = {
  name: "mee6Test",
};
