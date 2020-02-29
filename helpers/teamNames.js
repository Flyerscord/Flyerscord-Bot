const team_names = require("../team_info/team_names.json");

function getTeamNameFromAbrev(abrev) {
  let name = team_names[abrev.toLowerCase()].name;
  if (name != null) {
    return name;
  } else {
    return -1;
  }
}

function getTeamTagFromAbrev(abrev) {
  let tag = team_names[abrev.toLowerCase()].tag;
  if (tag != null) {
    return tag;
  } else {
    return -1;
  }
}

module.exports.getTeamNameFromAbrev = getTeamNameFromAbrev;
module.exports.getTeamTagFromAbrev = getTeamTagFromAbrev;