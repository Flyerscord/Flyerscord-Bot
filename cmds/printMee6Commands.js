const fetch = require("node-fetch");

module.exports.run = async (client, message, args) => {
  if (
    message.channel.id == 345701810616532993 ||
    message.channel.id == 743100445282795621
  ) {
    message.delete();

    if (message.attachments.size > 0) {
      let file = message.attachments.first().url;

      try {
        const response = await fetch(file);

        // if there was an error send a message with the status
        if (!response.ok) {
          console.error(
            "There was an error with fetching the file:",
            response.statusText
          );
          return;
        }

        // take the response stream and read it to completion
        const text = await response.text();

        if (text) {
          parseAndSendMessage(message, text, true);
        } else {
          return;
        }
      } catch (error) {
        console.log(error);
      }
    } else if (args.length > 0) {
      parseAndSendMessage(message, args, false);
    } else {
      return;
    }
  }
};

module.exports.help = {
  name: "mee6Cmds",
};

function parseAndSendMessage(message, input, isFile) {
  if (isFile) {
    var all = input;
  } else {
    var all = input.join("");
  }

  let descriptionRegex = /^[A-Za-z0-9].+$/gm;
  all = all.replace(descriptionRegex, "");

  if (isFile) {
    var emptyLineRegex = /^[\r\n]+/gm;
  } else {
    var emptyLineRegex = /^\n/gm;
  }
  all = all.replace(emptyLineRegex, "");

  if (isFile) {
    var lines = all.split("\r").length;
  } else {
    var lines = all.split("\n").length;
  }

  var now = new Date();
  var mm = now.getMonth() + 1;
  var dd = now.getDate();
  var yy = now.getFullYear().toString().slice(-2);

  var header = `**Mee6 Commands as of ${mm}/${dd}/${yy} (${lines - 1} commands)**`;
  message.channel.send(`${header}\n${all}`);
}
