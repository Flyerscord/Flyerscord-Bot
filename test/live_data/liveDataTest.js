const { Client } = require("discord.js");

const boxscore = require("./boxscore.json");
const play = require("./play.json");

const globals = require("../../lib/common/globals.js");
const parse = require("../../lib/live_data/parseAndSend.js");
const logging = require("../../lib/common/logging.js");
const _config = require("../../lib/common/config.js");

var token = _config.token;

// Create the Discord Client
globals.client = new Client();

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

globals.client.on("ready", async () => {
  logging.logEvent("Bot is ready!", "System");
  logging.logEvent("Starting test!", "Test");
  testGoal();
  logging.logEvent("End of test!", "Test");
  setTimeout(() => {
    process.exit(1);
  }, 5000);
});

globals.client.login(token);

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */
const testGoal = () => {
  logging.logDebug("Sending message", "testGoal");
  parse.sendGoalMessage(boxscore, play);
};
