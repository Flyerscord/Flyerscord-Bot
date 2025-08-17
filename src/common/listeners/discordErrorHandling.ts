import { Client } from "discord.js";
import Stumper from "stumper";
import ConfigManager from "@common/config/ConfigManager";

export default (client: Client): void => {
  client.on("error", (error) => {
    Stumper.error(`${error.name}: ${error.message}`, "DiscordClientError");
  });

  client.on("warn", (warning) => {
    Stumper.warning(warning, "DiscordClientWarning");
  });

  client.on("debug", (debug) => {
    if (ConfigManager.getInstance().getConfig("Common").advancedDebug) {
      Stumper.debug(debug, "DiscordClientDebug");
    }
  });
};
