import { Client } from "discord.js";

export default class ClientManager {
  private static instance: ClientManager;

  public client: Client;

  private constructor(client: Client) {
    this.client = client;
  }

  public static getInstance(client?: Client): ClientManager {
    if (!ClientManager.instance && client) {
      ClientManager.instance = new ClientManager(client);
    }
    return ClientManager.instance;
  }
}
