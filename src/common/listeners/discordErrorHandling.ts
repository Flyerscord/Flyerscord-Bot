import { Client } from "discord.js";
import Stumper from "stumper";
import EnvManager from "../managers/EnvManager";

export default (client: Client): void => {
  client.on("error", (error) => {
    Stumper.caughtError(error, "common:discordErrorHandling:onError");
  });

  client.on("warn", (warning) => {
    Stumper.caughtWarning(warning, "common:discordErrorHandling:onWarn");
  });

  client.on("debug", (debug) => {
    if (EnvManager.getInstance().get("ADVANCED_DEBUG")) {
      Stumper.debug(debug, "common:discordErrorHandling:onDebug");
    }
  });
};
