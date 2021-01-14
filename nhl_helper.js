const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
const { exec } = require("child_process");

var prefix = null;
if (config.testMode) {
  prefix = "!";
} else {
  prefix = config.prefix;
}

client.commands = new Discord.Collection();

// Set up handlers for process events
process.on("unhandledRejection", function (err, p) {
  console.error("Unhandled Rejection");
  console.error(err);
  console.error(p);
});

process.on("warning", (warning) => {
  console.warn(warning.name); // Print the warning name
  console.warn(warning.message); // Print the warning message
  console.warn(warning.stack); // Print the stack trace
});

client.on("error", console.error);

fs.readdir("./cmds/", (err, files) => {
  if (err) console.error(err);
  let jsFiles = files.filter((f) => f.split(".").pop() === "js");

  if (jsFiles.length <= 0) {
    console.log("No commands to load!");
    return;
  }

  console.log(`Loading ${jsFiles.length} commands!`);

  jsFiles.forEach((f, i) => {
    let props = require(`./cmds/${f}`);
    console.log(`${i + 1}: ${f} loaded!`);
    client.commands.set(props.help.name, props);
  });
});

client.on("ready", () => {
  console.log("Bot is ready!");
});

client.on("message", (message) => {
  if (
    message.content.includes("you just advanced") &&
    // MEE6 user ID
    message.author.id == 796849687436066826
  ) {
    let regex = /level ([0-9]+)/;
    let res = message.content.match(regex);
    let pNum = res[1];
    exec(
      `curl -s 'http://www.flyershistory.com/cgi-bin/rosternum.cgi?${pNum}' | hxnormalize -l 1024 -x | hxselect -c -s '\n' 'tbody tr td a font'`,
      (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        if (stdout.length != 0) {
          let names = createNamesMessage(stdout);
          message.channel.send(
            `Flyers players that have had the number **${pNum}**:\n${names}`
          );
        } else {
          message.channel.send(
            `No Flyers player has ever had the number **${pNum}**!`
          );
        }
      }
    );
  }

  if (message.author.bot) return; // ignores all bots
  if (message.channel.type != "text") return; // ignores all dm's
  if (!message.content.startsWith(prefix)) return; // ignores all messages that dont start with the prefix

  let messageArray = message.content.split(" ");
  let command = messageArray[0];
  let args = messageArray.slice(1);

  let cmd = client.commands.get(command.slice(prefix.length));
  try {
    if (cmd) cmd.run(client, message, args);
  } catch (err) {
    console.error(err);
  }
});

if (config.testMode) {
  client.login(config.testToken);
} else {
  client.login(config.token);
}

function createNamesMessage(stdout) {
  const spacing = 25;
  var result = "```\n";

  var names = stdout.split("\n");
  names.forEach((name, i) => {
    if (i != names.length - 1) {
      if (i % 2 == 0) {
        // Needs the spacing
        result = `${result}${name.padEnd(spacing)}`;
      } else {
        // In the second column
        result = `${result}${name}\n`;
      }
    }
  });
  return result + "```";
}
