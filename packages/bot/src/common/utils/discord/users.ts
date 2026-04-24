import { User } from "discord.js";
import ClientManager from "../../managers/ClientManager";

export async function getUser(userId: string, force: boolean = false): Promise<User | undefined> {
  const client = ClientManager.getInstance().client;
  if (force) {
    return await client.users.fetch(userId);
  }
  return client.users.cache.get(userId);
}
