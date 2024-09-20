import { Channel, Client } from "discord.js";

export function getChannel(client: Client, channelId: string): Channel | undefined {
  return client.channels.cache.get(channelId);
}
