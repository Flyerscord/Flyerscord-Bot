/* -------------------------------------------------------------------------- */
/*                              External Libaries                             */
/* -------------------------------------------------------------------------- */
const { Client, Collection } = require("discord.js");
const fs = require("fs");
const { exec } = require("child_process");
const { JsonStorage, config } = require("json-storage-fs");

/* -------------------------------------------------------------------------- */
/*                             Internal Libraries                             */
/* -------------------------------------------------------------------------- */
const liveData = require("./lib/live_data/checkData.js");
const logging = require("./lib/common/logging.js");
const globals = require("./lib/common/globals.js");
const _config = require("./lib/common/config.js");
const levelUp = require("./lib/level_up_players/levelUp.js");
const visitorReact = require("./lib/visitor_react_role/visitorReact.js");

// Create the Discord Client
globals.client = new Client();

// Create a collection in the client object for the commands to be loaded into
globals.client.commands = new Collection();

// Create the database
config({ catalog: "./data/" });

/* -------------------------------------------------------------------------- */
/*                         Bot Test Mode Configuration                        */
/* -------------------------------------------------------------------------- */

var prefix = _config.prefix;
var token = _config.token;
var memberRoleId = _config.vistorReactRole.memberRoleId;
var visitorRoleId = _config.vistorReactRole.visitorRoleId;
var vistorEmojiId = _config.vistorReactRole.visitorEmojiId;
var rolesChannelId = _config.vistorReactRole.rolesChannelId;

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
// The ID of the home team for the current game
var homeTeam = 0;
// The ID of the away team for the current game
var awayTeam = 0;

/* -------------------------------------------------------------------------- */
/*                               Error Handling                               */
/* -------------------------------------------------------------------------- */
// Process Unhandled Exception
process.on("unhandledRejection", function (err, p) {
  logging.logError(err, "Unhandled Exception");
  logging.logError(p, "Unhandled Exception");
});

// Process Warning
process.on("warning", (warning) => {
  logging.logWarning(warning.message, warning.name);
  logging.logWarning(warning.stack, warning.name);
});

// Discord Bot Error
globals.client.on("error", (error) => {
  logging.logError(err, "Discord");
});

/* -------------------------------------------------------------------------- */
/*                           Reading in Bot Commands                          */
/* -------------------------------------------------------------------------- */
fs.readdir("./cmds/", (err, files) => {
  if (err) logging.logError(err, "File Read");
  let jsFiles = files.filter((f) => f.split(".").pop() === "js");

  if (jsFiles.length <= 0) {
    logging.logEvent("No commands to load!", "System");
    return;
  }

  logging.logEvent(`Loading ${jsFiles.length} commands!`, "System");

  jsFiles.forEach((f, i) => {
    let props = require(`./cmds/${f}`);
    logging.logEvent(`${i + 1}: ${f} loaded!`, "System");
    globals.client.commands.set(props.help.name, props);
  });
});

/* -------------------------------------------------------------------------- */
/*                           Bot Client Event: Ready                          */
/* -------------------------------------------------------------------------- */
globals.client.on("ready", async () => {
  logging.logEvent("Bot is ready!", "System");
//   if (!JsonStorage.get("visitorMessageID")) {
//     visitorReact.sendVisitorReactionMessage();
//   } else {
//     let channel = globals.client.channels.cache.get(rolesChannelId);
//     try {
//       message = await channel.messages.fetch(JsonStorage.get("visitorMessageID"));
//     } catch (e) {
//       visitorReact.sendVisitorReactionMessage();
//     }
  }
});

/* -------------------------------------------------------------------------- */
/*                          Bot Client Event: Message                         */
/* -------------------------------------------------------------------------- */
globals.client.on("message", (message) => {
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
          logging.logError(error.message, "Roster Curl");
          return;
        }
        if (stderr) {
          logging.logError(stderr, "Roster Curl stderr");
          return;
        }
        if (stdout.length != 0) {
          let names = levelUp.createNamesMessage(stdout);
          message.channel.send(`Flyers players that have had the number **${pNum}**:\n${names}`);
        } else {
          message.channel.send(`No Flyers player has ever had the number **${pNum}**!`);
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

  let cmd = globals.client.commands.get(command.slice(prefix.length));
  try {
    if (cmd) cmd.run(globals.client, message, args);
  } catch (err) {
    logging.logError(err, "Commands");
  }
});

/* -------------------------------------------------------------------------- */
/*                      Bot Client Event: Reaction Added                      */
/* -------------------------------------------------------------------------- */
globals.client.on("messageReactionAdd", (reaction, user) => {
  if (user.bot) return;
  // logging.logDebug("Reaction added");
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
globals.client.on("messageReactionRemove", (reaction, user) => {
  if (user.bot) return;
  // logging.logDebug("Reaction removed");
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
globals.client.login(token);

// Check for live game data every second
setInterval(liveData.checkGameData, 1000);
