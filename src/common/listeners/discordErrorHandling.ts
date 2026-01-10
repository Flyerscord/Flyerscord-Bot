import { Client } from "discord.js";
import Stumper from "stumper";
import ConfigManager from "@root/src/common/managers/ConfigManager";

export default (client: Client): void => {
  client.on("error", (error) => {
    Stumper.caughtError(error, "DiscordClientError");
  });

  client.on("warn", (warning) => {
    Stumper.caughtWarning(warning, "DiscordClientWarning");
  });

  client.on("debug", (debug) => {
    if (ConfigManager.getInstance().getConfig("Common").advancedDebug) {
      Stumper.debug(debug, "DiscordClientDebug");
    }
  });
};
