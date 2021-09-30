const request = require("request");

var notificationChannel = "236400898300051457";
var periodRole = "799754763755323392";

var currentGame = 0;
var nextPlay = 0;

exports.checkGameData = () => {
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
            }
            // else if (eventType == "PERIOD_END") {
            //   sendPeriodEndMessage(play);
            // } else if (eventType == "GAME_END") {
            //   sendGameEndMessage(play);
            // } else if (eventType == "GOAL") {
            //   sendGoalMessage(play);
            // }
          });
          nextPlay = allPlays.length;
        }
      }
    });
  } else {
    console.log("There is no live game!");
  }
};

function getCurrentGame() {
  var date = getDate();
  var url = `https://statsapi.web.nhl.com/api/v1/schedule?teamId=4&date=${date}`;
  request({ url: url, json: true }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      let string = JSON.stringify(body);
      var obj = JSON.parse(string);
      if (obj.dates[0].games.length != 0) {
        currentGame = obj.dates[0].games[0].gamePk;
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
  var embed = new Discord.RichEmbed();
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
  client.channels.get(notificationChannel).send(`<@&${periodRole}> ${msg}`);
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
