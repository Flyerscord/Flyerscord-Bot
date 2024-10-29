import { User } from "discord.js";
import ClientManager from "../../managers/ClientManager";

export function getUser(userId: string): User | undefined {
  const client = ClientManager.getInstance().client;
  return client.users.cache.get(userId);
}
