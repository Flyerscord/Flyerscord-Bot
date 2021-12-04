const { Client, Intents, Collection } = require("discord.js");
const fs = require("fs");
const request = require("request");
const { exec } = require("child_process");
const { JsonStorage, config } = require("json-storage-fs");

const _config = require("./config.json");

config({ catalog: "./data/" });

var prefix = null;
if (_config.testMode) {
  prefix = "!";
} else {
  prefix = _config.prefix;
}

// const client = new Client({
//   intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
// });
const client = new Client();
client.commands = new Collection();

// For production
const memberRoleId = "655526764436652042";
const visitorRoleId = "799653932191580200";
const vistorEmoji = "<:nhl:799669949899210793>";
const vistorEmojiId = "799669949899210793";
const rolesChannelId = "799764588484100167";

// For testing
// const memberRoleId = "892991002921562172";
// const visitorRoleId = "892991062979805186";
// const vistorEmoji = "<:nhl:892991229426532372>";
// const vistorEmojiId = "892991229426532372";
// const rolesChannelId = "345701810616532993";

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

client.on("ready", async () => {
  console.log("Bot is ready!");
  if (!JsonStorage.get("visitorMessageID")) {
    sendVisitorReactionMessage();
  } else {
    let channel = client.channels.cache.get(rolesChannelId);
    try {
      message = await channel.messages.fetch(
        JsonStorage.get("visitorMessageID")
      );
    } catch (e) {
      sendVisitorReactionMessage();
    }
  }
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

client.on("messageReactionAdd", (reaction, user) => {
  if (user.bot) return;
  // console.log("Reaction added");
  var vistorMessageId = JsonStorage.get("visitorMessageID");
  if (reaction.message.id != vistorMessageId) return;
  if (reaction.emoji.id != vistorEmojiId) return;

  var member = reaction.message.guild.members.cache.get(user.id);

  if (member.roles.cache.some((role) => role.id == memberRoleId)) {
    member.roles.remove(memberRoleId);
  }
  if (!member.roles.cache.some((role) => role.id == visitorRoleId)) {
    member.roles.add(visitorRoleId);
  }
});

client.on("messageReactionRemove", (reaction, user) => {
  if (user.bot) return;
  // console.log("Reaction removed");
  var vistorMessageId = JsonStorage.get("visitorMessageID");
  if (reaction.message.id != vistorMessageId) return;
  if (reaction.emoji.id != vistorEmojiId) return;

  var member = reaction.message.guild.members.cache.get(user.id);

  if (member.roles.cache.some((role) => role.id == visitorRoleId)) {
    member.roles.remove(visitorRoleId);
  }
  if (!member.roles.cache.some((role) => role.id == memberRoleId)) {
    member.roles.add(memberRoleId);
  }
});

if (_config.testMode) {
  client.login(_config.testToken);
} else {
  client.login(_config.token);
}

var currentGame = 0;
var nextPlay = 0;
const notificationChannel = "236400898300051457";
const periodRole = "799754763755323392";

// Check for live game data every second
setInterval(checkGameData, 1000);

function checkGameData() {
  getCurrentGame();
  if (currentGame != 0) {
    var url = `https://statsapi.web.nhl.com/api/v1/game/${currentGame}/feed/live`;
    request({ url: url, json: true }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let string = JSON.stringify(body);
        var obj = JSON.parse(string);
        if (obj.liveData.plays) {
          var allPlays = obj.liveData.plays.allPlays;
          var cutPlays = allPlays.slice(nextPlay);
          // Loop through all of the events since the last check
          cutPlays.forEach((play) => {
            let eventType = play.result.eventTypeId;
            if (eventType == "PERIOD_START") {
              sendPeriodStartMessage(play);
            } else if (eventType == "GOAL") {
              sendGoalMessage(play);
            }
            // else if (eventType == "PERIOD_END") {
            //   sendPeriodEndMessage(play);
            // } else if (eventType == "GAME_END") {
            //   sendGameEndMessage(play);
            //
          });
          nextPlay = allPlays.length;
        }
      }
    });
  } else {
    //console.log("There is no live game!");
  }
}

function getCurrentGame() {
  var date = getDate();
  var url = `https://statsapi.web.nhl.com/api/v1/schedule?teamId=4&date=${date}`;
  request({ url: url, json: true }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      let string = JSON.stringify(body);
      var obj = JSON.parse(string);
      if (obj.dates.length > 0) {
        if (obj.dates[0].games.length > 0) {
          currentGame = obj.dates[0].games[0].gamePk;
        } else {
          currentGame = 0;
        }
      } else {
        currentGame = 0;
      }
    } else {
      currentGame = 0;
    }
  });
}

// Gets the current date in the format: YYYY-MM-DD
function getDate() {
  let ts = Date.now();
  let date = new Date(ts);
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  return `${year}-${month}-${day}`;
}

function sendGoalMessage(play) {
  // var embed = new Discord.MessageEmbed();
  logEvent("Goal");
}

function sendPeriodStartMessage(play) {
  var msg = null;
  if (
    play.about.ordinalNum == "1st" ||
    play.about.ordinalNum == "2nd" ||
    play.about.ordinalNum == "3rd"
  ) {
    msg = `The ${play.about.ordinalNum} period is starting!`;
  } else if (play.about.ordinalNum == "OT") {
    msg = "Overtime is starting!";
  } else if (play.about.ordinalNum == "SO") {
    msg = "The shootout is starting!";
  }
  logEvent(msg);
  client.channels.cache
    .get(notificationChannel)
    .send(`<@&${periodRole}> ${msg}`);
}

function sendPeriodEndMessage(play) {
  logEvent("Period End");
}

function sendGameEndMessage(play) {
  logEvent("Game End");
}

function logEvent(event) {
  let ts = Date.now();
  let date = new Date(ts);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  var time = `${hours}:${minutes}:${seconds}`;
  console.log(`${time} - ${event}`);
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

async function sendVisitorReactionMessage() {
  let embed = {
    title: "Visitor Role Selection",
    description: `${vistorEmoji} Get the Visitor Role (Everyone else will get the member role)`,
  };
  var message = await client.channels.cache
    .get(rolesChannelId)
    .send({ embed: embed });
  JsonStorage.set("visitorMessageID", message.id);
  message.react(vistorEmoji);
}
