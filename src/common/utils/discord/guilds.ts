import { Guild } from "discord.js";
import ClientManager from "../../managers/ClientManager";
import Config from "../../config/Config";

export function getGuild(): Guild | undefined {
  const client = ClientManager.getInstance().client;
  return client.guilds.cache.get(Config.getConfig().masterGuildId);
}
