import Stumper from "stumper";
import ConfigManager from "../config/ConfigManager";
import { ActivityType, Client } from "discord.js";
import fs from "node:fs";
import { onReady } from "@strenkml/discordjs-utils";

export default (client: Client): void => {
  onReady(client, setupBot);
};

function setupBot(client: Client): void {
  const configManager = ConfigManager.getInstance();
  if (configManager.getConfig("Common").productionMode) {
    Stumper.info("Setting bot presence", "common:onReady:setupBot");
    client.user?.setPresence({ status: "online", activities: [{ name: "Flyers Hockey", type: ActivityType.Watching }] });

    Stumper.info("Setting bot avatar", "common:onReady:setupBot");
    const avatar = fs.readFileSync(`${__dirname}/../assets/botAvatar.png`);
    client.user?.setAvatar(avatar);

    Stumper.info("Setting bot banner", "common:onReady:setupBot");
    const banner = fs.readFileSync(`${__dirname}/../assets/botBanner.png`);
    client.user?.setBanner(banner);

    Stumper.info("Setting bot username", "common:onReady:setupBot");
    client.user?.setUsername("Gritty");
  }
}
