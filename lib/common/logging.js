const dates = require("./dates.js");

/* -------------------------------------------------------------------------- */
/*                               Module Exports                               */
/* -------------------------------------------------------------------------- */
module.exports.logEvent = (event) => {
  let time = createDateAndTime();
  console.log(`${time} - ${event}`);
};

module.exports.logError = (error) => {
  let time = createDateAndTime();
  console.error(`${time} - ${error}`);
};
