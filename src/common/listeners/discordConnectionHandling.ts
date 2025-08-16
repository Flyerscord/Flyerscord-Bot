import { Client } from "discord.js";
import Stumper from "stumper";

export default (client: Client): void => {
  client.rest.on("response", (res) => {
    Stumper.debug(`Method: ${res.method}  Path: ${res.path}`, "[REST response]");
  });

  client.rest.on("rateLimited", (info) => {
    Stumper.warning(info, "[RateLimited]");
  });
};
