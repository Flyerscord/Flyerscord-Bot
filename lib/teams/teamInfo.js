const team_info = require("../../team_info/team_info.json");

function getID(teamName) {
  return team_info[teamName].id;
}

function getAwayColor(teamName) {
  let color = team_info[teamName].awayColor;
  color = color.replace("#", "0x");
  return parseInt(color);
}

function getHomeColor(teamName) {
  let color = team_info[teamName].homeColor;
  color = color.replace("#", "0x");
  return parseInt(color);
}

function getDivision(teamName) {
  return team_info[teamName].division;
}

function getConference(teamName) {
  return team_info[teamName].conference;
}

function getEmoji(teamName) {
  return team_info[teamName].emoji;
}

function getLogo(teamName) {
  return team_info[teamName].logo;
}

function getTeamURL(teamName) {
  return team_info[teamName].teamURL;
}

function getTimezone(teamName) {
  return team_info[teamName].timezone;
}

module.exports.getID = getID;
module.exports.getAwayColor = getAwayColor;
module.exports.getHomeColor = getHomeColor;
module.exports.getDivision = getDivision;
module.exports.getConference = getConference;
module.exports.getEmoji = getEmoji;
module.exports.getLogo = getLogo;
module.exports.getTeamURL = getTeamURL;
module.exports.getTimezone = getTimezone;
