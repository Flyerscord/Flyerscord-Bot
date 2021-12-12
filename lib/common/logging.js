const dates = require("./dates.js");

/* -------------------------------------------------------------------------- */
/*                               Module Exports                               */
/* -------------------------------------------------------------------------- */
module.exports.logEvent = (event) => {
  let time = dates.createDateAndTime();
  console.log(`${time} - ${event}`);
};

module.exports.logError = (error) => {
  let time = dates.createDateAndTime();
  console.error(`${time} - ${error}`);
};

module.exports.logWarning = (warning) => {
  let time = dates.createDateAndTime();
  console.warn(`${time} - ${warning}`);
};
