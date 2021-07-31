module.exports.run = async (client, message, args) => {
  if (
    message.channel.id == 345701810616532993 ||
    message.channel.id == 743100445282795621
  ) {
    message.delete();
    if (args.length == 0) return;
    var all = args.join("");
    let descriptionRegex = /^[A-Za-z0-9].+$/gm;
    all = all.replace(descriptionRegex, "");
    let emptyLineRegex = /^\n/gm;
    all = all.replace(emptyLineRegex, "");

    var lines = all.split("\n").length;

    var now = new Date();
    var mm = now.getMonth() + 1;
    var dd = now.getDate();
    var yy = now.getFullYear().toString().slice(-2);

    var header = `**Mee6 Commands as of ${mm}/${dd}/${yy} (${lines} commands)**`;
    message.channel.send(`${header}\n${all}`);
  }
};

module.exports.help = {
  name: "mee6Cmds",
};
