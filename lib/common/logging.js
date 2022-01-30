const dates = require("./dates.js");

/* -------------------------------------------------------------------------- */
/*                               Module Exports                               */
/* -------------------------------------------------------------------------- */
module.exports.logEvent = (event, type = null) => {
  let time = dates.createDateAndTime();
  if (type == null) {
    console.log(`${time} - EVENT: ${event}`);
  } else {
    console.log(`${time} - EVENT(${type}): ${event}`);
  }
};

module.exports.logError = (error, type = null) => {
  let time = dates.createDateAndTime();
  if (type == null) {
    console.error(`${time} - ERROR: ${error}`);
  } else {
    console.error(`${time} - ERROR(${type}): ${error}`);
  }
};

module.exports.logWarning = (warning, type = null) => {
  let time = dates.createDateAndTime();
  if (type == null) {
    console.warn(`${time} - WARN: ${warning}`);
  } else {
    console.warn(`${time} - WARN(${type}): ${warning}`);
  }
};

module.exports.logDebug = (debug, type = null) => {
  let time = dates.createDateAndTime();
  if (type == null) {
    console.log(`${time} - DEBUG: ${debug}`);
  } else {
    console.log(`${time} - DEBUG(${type}): ${debug}`);
  }
};
