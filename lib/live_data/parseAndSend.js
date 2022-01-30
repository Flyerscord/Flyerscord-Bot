const { MessageEmbed } = require("discord.js");
const { JsonStorage, config } = require("json-storage-fs");

const _config = require("../common/config.js");
const logging = require("../common/logging.js");
const globals = require("../common/globals.js");

// Create the database
config({ catalog: "../../data" });

/* -------------------------------------------------------------------------- */
/*                                  Variables                                 */
/* -------------------------------------------------------------------------- */
const notificationChannel = _config.liveData.notificationChannelId;
const periodRole = _config.liveData.periodNotificationRoleId;

/* -------------------------------------------------------------------------- */
/*                               Export Modules                               */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/*                                    Goal                                    */
/* -------------------------------------------------------------------------- */
module.exports.sendGoalMessage = (play) => {
  // var embed = new MessageEmbed();
  logging.logEvent("Goal");
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
  // delayEmbedSend(20, embed);
};

/* -------------------------------------------------------------------------- */
/*                                Period Start                                */
/* -------------------------------------------------------------------------- */
module.exports.sendPeriodStartMessage = (play) => {
  var canSend = true;
  if (play.about.ordinalNum == "1st" && JsonStorage.get("firstSent")) {
    canSend = false;
  }
  if (play.about.ordinalNum == "2nd" && JsonStorage.get("secondSent")) {
    canSend = false;
  }
  if (play.about.ordinalNum == "3rd" && JsonStorage.get("thirdSent")) {
    canSend = false;
  }
  if (play.about.ordinalNum == "OT" && JsonStorage.get("otSent")) {
    canSend = false;
  }
  if (play.about.ordinalNum == "SO" && JsonStorage.get("soSent")) {
    canSend = false;
  }

  if (canSend) {
    if (
      play.about.ordinalNum == "1st" ||
      play.about.ordinalNum == "2nd" ||
      play.about.ordinalNum == "3rd"
    ) {
      var msg = `The ${play.about.ordinalNum} period is starting!`;
      if (play.about.ordinalNum == "1st") {
        JsonStorage.set("firstSent", true);
      } else if (play.about.ordinalNum == "2nd") {
        JsonStorage.set("secondSent", true);
      } else {
        JsonStorage.set("thirdSent", true);
      }
    } else if (play.about.ordinalNum == "OT") {
      var msg = "Overtime is starting!";
      JsonStorage.set("otSent", true);
    } else if (play.about.ordinalNum == "SO") {
      var msg = "The shootout is starting!";
      JsonStorage.set("soSent", true);
    }
    logging.logEvent(msg);
    globals.client.channels.cache
      .get(notificationChannel)
      .send(`<@&${periodRole}> ${msg}`);
  }
};

/* -------------------------------------------------------------------------- */
/*                                 Period End                                 */
/* -------------------------------------------------------------------------- */
module.exports.sendPeriodEndMessage = (play) => {
  logging.logEvent("Period End");
};

/* -------------------------------------------------------------------------- */
/*                                  Game End                                  */
/* -------------------------------------------------------------------------- */
module.exports.sendGameEndMessage = (play) => {
  logging.logEvent("Game End");
};

/* -------------------------------------------------------------------------- */
/*                              Private Functions                             */
/* -------------------------------------------------------------------------- */
function delayEmbedSend(waitSeconds, embed) {
  setTimeout(() => {
    globals.client.channels.cache
      .get(notificationChannel)
      .send({ embed: embed });
  }, waitSeconds * 1000);
}
