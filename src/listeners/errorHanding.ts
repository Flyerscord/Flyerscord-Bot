import { Client } from "discord.js";
import Stumper from "stumper";

export default (client: Client): void => {
  // Process UnhandledRejection
  process.on("unhandledRejection", function (err, p) {
    Stumper.error(err, "Unhandled Exception");
    Stumper.error(p, "Unhandled Exception");
  });

  // Process Warning
  process.on("warning", (warning) => {
    Stumper.warning(warning.message, warning.name);
    Stumper.warning(warning.stack, warning.name);
  });

  // Discord Bot Error
  client.on("error", (error) => {
    Stumper.error(error, "DiscordClientError");
  });
};
