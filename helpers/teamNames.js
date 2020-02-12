const team_names = require("../team_info/team_names.json");

function getTeamNameFromAbrev(abrev) {
  let name = team_names[abrev.toLowerCase()];
  if (name != null) {
    return name;
  } else {
    return -1;
  }
}

module.exports.getTeamNameFromAbrev = getTeamNameFromAbrev;