const request = require("request");
const { JsonStorage, config } = require("json-storage-fs");

const parse = require("./parseAndSend.js");
const logging = require("../common/logging.js");
const dates = require("../common/dates.js");

// Create the database
config({ catalog: "../../data" });

/* -------------------------------------------------------------------------- */
/*                                  Variables                                 */
/* -------------------------------------------------------------------------- */
var currentGame = 0;

/* -------------------------------------------------------------------------- */
/*                               Module Exports                               */
/* -------------------------------------------------------------------------- */
module.exports.checkGameData = () => {
  if (!JsonStorage.get("lastPlay")) {
    JsonStorage.set("lastPlay", -1);
  }
  getCurrentGame();
  if (currentGame != 0) {
    var url = `https://statsapi.web.nhl.com/api/v1/game/${currentGame}/feed/live`;
    request({ url: url, json: true }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let string = JSON.stringify(body);
        var obj = JSON.parse(string);
        if (obj.liveData.plays) {
          var allPlays = obj.liveData.plays.allPlays;
          // Loop through all of the events since the last check
          allPlays.forEach((play, index) => {
            if (index <= JsonStorage.get("lastPlay")) {
              return;
            }
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
          JsonStorage.set("lastPlay", allPlays.length - 1);
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
          if (currentGame != JsonStorage.get("previousGameID")) {
            JsonStorage.set("lastPlay", -1);
            JsonStorage.set("previousGameID", currentGame);
            logging.logDebug(currentGame, "New Game");
          }
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
