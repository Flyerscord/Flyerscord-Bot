import { Client } from "discord.js";
import Stumper from "stumper";
import EnvManager from "../managers/EnvManager";

export default (client: Client): void => {
  client.rest.on("response", (res) => {
    if (EnvManager.getInstance().get("ADVANCED_DEBUG")) {
      Stumper.debug(`Method: ${res.method}  Path: ${res.path}`, "[REST response]");
    }
  });

  client.rest.on("rateLimited", (info) => {
    Stumper.warning(info, "[RateLimited]");
  });
};
