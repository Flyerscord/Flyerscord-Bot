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
    message.author.id == 159985870458322944
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
          message.channel.send(
            `The following Flyers players have had the number ${pNum}:\n${stdout}`
          );
        } else {
          message.channel.send(
            `No Flyers player has ever had the number ${pNum}!`
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

var lastUpdateTime = 0;

// Check for live game data every 30 seconds
setInterval(checkGameData, 30);

function checkGameData() {
  var currentGame = getCurrentGame();
  if (currentGame != 0) {
    var url = `https://statsapi.web.nhl.com/api/v1/game/${currentGame}/feed/live/diffPatch?startTimecode=${lastUpdateTime}`;
    request({ url: url, json: true }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let string = JSON.stringify(body);
        var obj = JSON.parse(string);

        var allPlays = obj.liveData.plays.allPlays;

        // Loop through all of the events since the last check
        allPlays.forEach((play) => {
          let eventType = play.result.eventTypeId;
          if (eventType == "PERIOD_START") {
            sendPeriodStartMessage(play);
          } else if (eventType == "PERIOD_END") {
            sendPeriodEndMessage(play);
          } else if (eventType == "GAME_END") {
            sendGameEndMessage(play);
          } else if (eventType == "GOAL") {
            sendGoalMessage(play);
          }
        });
      }
    });
  }
  lastUpdateTime = getDateTime();
}

// If there is a game for the current day, get the game id
function getCurrentGame() {
  var date = getDate();
  var url = `https://statsapi.web.nhl.com/api/v1/schedule?teamId=4&date=${date}`;
  request({ url: url, json: true }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      let string = JSON.stringify(body);
      var obj = JSON.parse(string);
      if (obj.dates.length == 1) {
        return obj.dates[0].games[0].gamePk;
      } else {
        return 0;
      }
    } else {
      return 0;
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

// Gets the current date and time in the format: YYYYMMDD_hhmmss
function getDateTime() {
  let ts = Date.now();
  let date = new Date(ts);
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();

  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

function sendGoalMessage(play) {
  var embed = new Discord.RichEmbed();
}

function sendPeriodStartMessage(play) {
  var embed = new Discord.RichEmbed();
}

function sendPeriodEndMessage(play) {
  var embed = new Discord.RichEmbed();
}

function sendGameEndMessage(play) {
  var embed = new Discord.RichEmbed();
}
