const request = require("request");

/* -------------------------------------------------------------------------- */
/*                               Module Exports                               */
/* -------------------------------------------------------------------------- */
module.exports.checkGameData = () => {
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
};

/* -------------------------------------------------------------------------- */
/*                              Private Functions                             */
/* -------------------------------------------------------------------------- */
// Checks to see if the Flyers have a game today
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
