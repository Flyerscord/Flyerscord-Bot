import { Client } from "discord.js";
import Logger from "stumper";

export default (client: Client): void => {
  // Process UnhandledRejection
  process.on("unhandledRejection", function (err, p) {
    Logger.error(err, "Unhandled Exception");
    Logger.error(p, "Unhandled Exception");
  });

  // Process Warning
  process.on("warning", (warning) => {
    Logger.warning(warning.message, warning.name);
    Logger.warning(warning.stack, warning.name);
  });

  // Discord Bot Error
  client.on("error", (error) => {
    Logger.error(error, "DiscordClientError");
  });
};
