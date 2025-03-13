import { Guild } from "discord.js";
import ClientManager from "../../managers/ClientManager";
import CommonModule from "../../CommonModule";

export function getGuild(): Guild | undefined {
  const client = ClientManager.getInstance().client;
  return client.guilds.cache.get(CommonModule.getInstance().config.masterGuildId);
}
