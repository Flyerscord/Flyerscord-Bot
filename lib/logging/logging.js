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

/* -------------------------------------------------------------------------- */
/*                              Private Functions                             */
/* -------------------------------------------------------------------------- */
function createDateAndTime() {
  let ts = Date.now();
  let date = new Date(ts);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  let milliseconds = date.getMilliseconds();

  let month = date.getMonth() + 1;
  let day = date.getDate();
  let year = date.getYear();

  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}
