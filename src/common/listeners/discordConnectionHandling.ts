import { Client } from "discord.js";
import Stumper from "stumper";
import ConfigManager from "@common/config/ConfigManager";

export default (client: Client): void => {
  client.rest.on("response", (res) => {
    if (ConfigManager.getInstance().getConfig("Common").advancedDebug) {
      Stumper.debug(`Method: ${res.method}  Path: ${res.path}`, "[REST response]");
    }
  });

  client.rest.on("rateLimited", (info) => {
    Stumper.warning(info, "[RateLimited]");
  });
};
