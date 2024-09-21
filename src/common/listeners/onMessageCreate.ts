import { Client, Message } from "discord.js";

import Config from "../config/Config";
import TextCommand from "../models/TextCommand";
import Stumper from "stumper";

export default (client: Client): void => {
  client.on("messageCreate", async (message: Message) => {
    if (checkForNormalTextCommand(message)) return;
  });
};

function checkForNormalTextCommand(message: Message): boolean {
  const prefix = Config.getConfig().prefix;
  if (message.author.bot) return false;
  if (!message.channel.isTextBased()) return false;
  if (!message.content.startsWith(prefix)) return false;

  const messageArray = message.content.split(" ");
  const command = messageArray[0];
  const args = messageArray.slice(1);

  const textCmd: TextCommand = message.client.textCommands.get(command.slice(prefix.length));
  try {
    if (textCmd) {
      textCmd.execute(message, args);
      Stumper.info(`Command ${command} called!`, "checkForNormalTextCommand");
      return true;
    }
  } catch (err) {
    Stumper.error(`Message content: ${message.content}  Error: ${err}`, "checkForNormalTextCommand");
  }
  return false;
}
