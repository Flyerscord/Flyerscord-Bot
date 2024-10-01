import { Channel, Client } from "discord.js";
import ClientManager from "../../managers/ClientManager";

export function getChannel(client: Client, channelId: string): Channel | undefined {
  return client.channels.cache.get(channelId);
}

export function createPost(forumChannelId: string, postName: string, postContent: string): void {
  const client = ClientManager.getInstance().client;

  const forumChannel = getChannel(client, forumChannelId);
  if (forumChannel) {
    // TODO: Implement
  }
}
