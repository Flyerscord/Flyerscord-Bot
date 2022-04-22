const { MessageEmbed } = require("discord.js");
const { JsonStorage, config } = require("json-storage-fs");

const _config = require("../common/config.js");
const logging = require("../common/logging.js");
const globals = require("../common/globals.js");
const teamInfo = require("../teams/teamInfo.js");

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
module.exports.sendGoalMessage = (boxscore, play) => {
  var embed = new MessageEmbed();
  logging.logEvent("Goal");
  var description = play.result.description;
  var strength = play.result.strength.code;
  var emptyNet = play.result.emptyNet;
  var period = play.about.ordinalNum;
  var timeLeft = play.about.periodTimeRemaining;

  if (strength == "EVEN") {
    var strengthString = "Even Strength";
  } else if (strength == "SHG") {
    var strengthString = "Short Handed";
  } else if (strength == "PPG") {
    var strengthString = "Power Play";
  } else {
    var strengthString = "";
  }

  if (emptyNet) {
    var emptyNetString = "Empty Net ";
  } else {
    var emptyNetString = "";
  }

  var scoringTeamName = play.team.name;
  if (boxscore.teams.away.team.name == scoringTeamName) {
    var opponentTeamName = boxscore.teams.home.team.name;
    var home = false;
  } else {
    var opponentTeamName = boxscore.teams.away.team.name;
    var home = true;
  }

  if (home) {
    var teamColor = teamInfo.getHomeColor(scoringTeamName);
  } else {
    var teamColor = teamInfo.getAwayColor(scoringTeamName);
  }

  if (opponentTeamName == "Philadelphia Flyers") {
    var flyersScoredOn = true;
  } else {
    var flyersScoredOn = false;
  }

  var homeEmoji = globals.client.emojis.cache?.find((emoji) => emoji.name === teamInfo.getEmoji(boxscore.teams.home.team.name));
  var awayEmoji = globals.client.emojis.cache?.find((emoji) => emoji.name === teamInfo.getEmoji(boxscore.teams.away.team.name));
  var goalEmoji = globals.client.emojis.cache?.find((emoji) => emoji.name === "goal");

  embed.setTitle(`${goalEmoji} ${scoringTeamName} ${emptyNetString}${strengthString} Goal ${goalEmoji}`);
  embed.setDescription(description);
  embed.setColor(teamColor);
  embed.addField(
    `${homeEmoji} ${boxscore.teams.home.team.name} ${homeEmoji}`,
    `**Goals:** ${boxscore.teams.home.teamStats.teamSkaterStats.goals}\n**Shots:** ${boxscore.teams.home.teamStats.teamSkaterStats.shots}`,
    true
  );
  embed.addField(
    `${awayEmoji} ${boxscore.teams.away.team.name} ${awayEmoji}`,
    `**Goals:** ${boxscore.teams.away.teamStats.teamSkaterStats.goals}\n**Shots:** ${boxscore.teams.away.teamStats.teamSkaterStats.shots}`,
    true
  );
  embed.setThumbnail(teamInfo.getLogo(scoringTeamName));
  embed.setFooter(`${timeLeft} left in the ${period} period.`);
  embed.setTimestamp(Date.now());

  // Delay the message for 20 seconds to avoid spoilers
  const waitTime = 20;
  if (flyersScoredOn) {
    delayEmbedSendWithFile(waitTime, embed, "./assets/videos/sonk.mp4");
  } else {
    delayEmbedSend(waitTime, embed);
  }
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
    if (play.about.ordinalNum == "1st" || play.about.ordinalNum == "2nd" || play.about.ordinalNum == "3rd") {
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
    globals.client.channels.cache.get(notificationChannel).send(`<@&${periodRole}> ${msg}`);
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
    globals.client.channels.cache.get(notificationChannel).send({ embed: embed });
  }, waitSeconds * 1000);
}

function delayEmbedSendWithFile(waitSeconds, embed, file) {
  setTimeout(() => {
    globals.client.channels.cache.get(notificationChannel).send({
      embed: embed,
    });
    globals.client.channels.cache.get(notificationChannel).send({
      files: [{ attachment: file }],
    });
  }, waitSeconds * 1000);
}
