import { Client, Message } from "discord.js";

import Config from "../config/Config";
import TextCommand from "../models/TextCommand";
import Stumper from "stumper";

export default (client: Client): void => {
  client.on("messageCreate", async (message: Message) => {
    const prefix = Config.getConfig().prefix;

    // Ignores all bots
    if (message.author.bot) return;
    // Ignores all messages not in a text channel
    if (!message.channel.isTextBased()) return;
    // Ignores messages that dont start with the prefix
    if (!message.content.startsWith(prefix)) return;

    const messageArray = message.content.split(" ");
    const command = messageArray[0];
    const args = messageArray.slice(1);

    const textCmd: TextCommand = message.client.textCommands.get(command.slice(prefix.length));
    try {
      if (textCmd) {
        textCmd.execute(message, args);
        Stumper.info(`Command ${command} called!`, "messageCreate");
      }
    } catch (err) {
      Stumper.error(`Message content: ${message.content}  Error: ${err}`, "messageCreate");
    }
  });
};
