// Reads in the bot config for either testing or production
const config = require("../../config.json");

/* -------------------------------------------------------------------------- */
/*                               Module Exports                               */
/* -------------------------------------------------------------------------- */
module.exports = config.testMode ? config.test : config.production;
