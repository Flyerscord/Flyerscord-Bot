import { Client } from "discord.js";
import Stumper from "stumper";
import Env from "../utils/Env";

export default (client: Client): void => {
  client.rest.on("response", (res) => {
    if (Env.getBoolean("ADVANCED_DEBUG")) {
      Stumper.debug(`Method: ${res.method}  Path: ${res.path}`, "[REST response]");
    }
  });

  client.rest.on("rateLimited", (info) => {
    Stumper.warning(info, "[RateLimited]");
  });
};
