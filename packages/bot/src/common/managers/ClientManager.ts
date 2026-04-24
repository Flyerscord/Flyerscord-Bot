import { Client } from "discord.js";
import { Singleton } from "../models/Singleton";

export default class ClientManager extends Singleton {
  client: Client;

  constructor(client: Client) {
    super();
    this.client = client;
  }
}
