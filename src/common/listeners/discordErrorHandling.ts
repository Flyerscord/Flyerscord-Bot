import { Client } from "discord.js";
import Stumper from "stumper";
import Env from "../utils/Env";

export default (client: Client): void => {
  client.on("error", (error) => {
    Stumper.caughtError(error, "DiscordClientError");
  });

  client.on("warn", (warning) => {
    Stumper.caughtWarning(warning, "DiscordClientWarning");
  });

  client.on("debug", (debug) => {
    if (Env.getBoolean("ADVANCED_DEBUG")) {
      Stumper.debug(debug, "DiscordClientDebug");
    }
  });
};
