const { Client, Intents, Collection } = require("discord.js");
const fs = require("fs");
const request = require("request");
const { exec } = require("child_process");
const { JsonStorage, config } = require("json-storage-fs");

// Read in the config file
const _config = require("./config.json");

// Create the database
config({ catalog: "./data/" });

// Create the Discord Client
const client = new Client();

// Create a collection in the client object for the commands to be loaded into
client.commands = new Collection();

/* -------------------------------------------------------------------------- */
/*                         Bot Test Mode Configuration                        */
/* -------------------------------------------------------------------------- */
if (_config.testMode) {
  // Test Mode Enabled
  var prefix = "!";
  var token = _config.testToken;
  var memberRoleId = "892991002921562172";
  var visitorRoleId = "892991062979805186";
  var vistorEmoji = "<:nhl:892991229426532372>";
  var vistorEmojiId = "892991229426532372";
  var rolesChannelId = "345701810616532993";
} else {
  // Test Mode Disabled
  var prefix = _config.prefix;
  var token = _config.token;
  var memberRoleId = "655526764436652042";
  var visitorRoleId = "799653932191580200";
  var vistorEmoji = "<:nhl:799669949899210793>";
  var vistorEmojiId = "799669949899210793";
  var rolesChannelId = "799764588484100167";
}

/* -------------------------------------------------------------------------- */
/*                            Variable Declarations                           */
/* -------------------------------------------------------------------------- */
// The ID of the current NHL game (used for live data)
var currentGame = 0;
// The ID of the channel that the live data updates are sent to
const notificationChannel = "236400898300051457";
// The ID of the period notifications role
const periodRole = "799754763755323392";
// The time and the date in string format of the last live data check
var timeOfLastCheck = "";
// The IF of the home team for the current game
var homeTeam = 0;
// The ID of the away team for the current game
var awayTeam = 0;

/* -------------------------------------------------------------------------- */
/*                               Error Handling                               */
/* -------------------------------------------------------------------------- */
// Process Unhandled Exception
process.on("unhandledRejection", function (err, p) {
  console.error("Unhandled Rejection");
  console.error(err);
  console.error(p);
});

// Process Warning
process.on("warning", (warning) => {
  console.warn(warning.name);
  console.warn(warning.message);
  console.warn(warning.stack);
});

// Discord Bot Error
client.on("error", console.error);

/* -------------------------------------------------------------------------- */
/*                           Reading in Bot Commands                          */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/*                           Bot Client Event: Ready                          */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/*                          Bot Client Event: Message                         */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/*                      Bot Client Event: Reaction Added                      */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/*                     Bot Client Event: Reaction Removed                     */
/* -------------------------------------------------------------------------- */
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

// Connect the bot
client.login(token);

timeOfLastCheck();

// Check for live game data every second
setInterval(checkGameData, 1000);

function checkGameData() {
  getCurrentGame();
  if (currentGame != 0) {
    var url = `https://statsapi.web.nhl.com/api/v1/game/${currentGame}/feed/live/diffPatch?startTimecode=${timeOfLastCheck}`;
    request({ url: url, json: true }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let string = JSON.stringify(body);
        var obj = JSON.parse(string);
        timeOfLastCheck();
        if (obj.liveData.plays) {
          var allPlays = obj.liveData.plays.allPlays;
          // Loop through all of the events since the last check
          allPlays.forEach((play) => {
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
  var scorer = 0;
  var assists = [];
  var type = play.result.secondaryType;
  var emptyNet = play.result.emptyNet;
  var period = play.about.ordinalNum;
  var time = play.about.periodTime;

  play.players.forEach((player) => {
    if (player.playerType === "Scorer") {
      scorer = player.id;
    } else if (player.playerType === "Assist") {
      assists.push(player.id);
    }
  });

  // Delay the message for 20 seconds to avoid spoilers
  setTimeout(() => {}, 20000);
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

function createStartTimecode() {
  var utcTime = new Date(new Date().toUTCString());
  timeOfLastCheck = `${utcTime.getFullYear}${
    utcTime.getMonth() + 1
  }${utcTime.getDate()}_${utcTime.getHours()}${utcTime.getMinutes()}`;
}
