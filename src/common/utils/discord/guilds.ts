import { Guild } from "discord.js";
import ClientManager from "../../managers/ClientManager";
import ConfigManager from "@common/config/ConfigManager";

export function getGuild(): Guild | undefined {
  const client = ClientManager.getInstance().client;
  return client.guilds.cache.get(ConfigManager.getInstance().getConfig("Common").masterGuildId);
}
