import { Client } from "discord.js";
import Stumper from "stumper";

export default (client: Client): void => {
    client.on("error", (error) => {
        Stumper.error(error, "DiscordClientError");
    });
};