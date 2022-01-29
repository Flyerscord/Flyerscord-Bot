const request = require("request");
const { JsonStorage, config } = require("json-storage-fs");

const parse = require("./parseAndSend.js");
// const logging = require("../common/logging.js");
const dates = require("../common/dates.js");

// Create the database
config({ catalog: "../../data" });

/* -------------------------------------------------------------------------- */
/*                                  Variables                                 */
/* -------------------------------------------------------------------------- */
var timeOfLastCheck = -1;
var currentGame = 0;

/* -------------------------------------------------------------------------- */
/*                               Module Exports                               */
/* -------------------------------------------------------------------------- */
module.exports.checkGameData = () => {
  getCurrentGame();
  if (currentGame != 0) {
    timeOfLastCheck = JsonStorage.get("timeOfLastCheck");
    if (!timeOfLastCheck) {
      timeOfLastCheck = dates.createStartTimecode();
    }

    var url = `https://statsapi.web.nhl.com/api/v1/game/${currentGame}/feed/live/diffPatch?startTimecode=${timeOfLastCheck}`;
    request({ url: url, json: true }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let string = JSON.stringify(body);
        var obj = JSON.parse(string);
        JsonStorage.set("timeOfLastCheck", dates.createStartTimecode());
        if (obj.liveData.plays) {
          var allPlays = obj.liveData.plays.allPlays;
          // Loop through all of the events since the last check
          allPlays.forEach((play) => {
            let eventType = play.result.eventTypeId;
            if (eventType == "PERIOD_START") {
              parse.sendPeriodStartMessage(play);
            } else if (eventType == "GOAL") {
              parse.sendGoalMessage(play);
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
    // logging.logError("There are no live games!", "checkData");
  }
};

/* -------------------------------------------------------------------------- */
/*                              Private Functions                             */
/* -------------------------------------------------------------------------- */

// Checks to see if the Flyers have a game today
function getCurrentGame() {
  var date = dates.getDate();
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
