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
  if (!message.content.startsWith(prefix.normal) && !message.content.startsWith(prefix.admin)) return false;

  const messageArray = message.content.split(" ");
  let command = messageArray[0];
  const args = messageArray.slice(1);

  const textCmd: TextCommand = message.client.textCommands.get(command);
  try {
    if (textCmd) {
      Stumper.info(`Command ${command} called by user ${message.author.username}!`, "checkForNormalTextCommand");
      textCmd.run(message, args);
      return true;
    } else {
      Stumper.debug(`Command ${command} not found!`, "checkForNormalTextCommand");
    }
  } catch (err) {
    Stumper.error(`Message content: ${message.content}  Error: ${err}`, "checkForNormalTextCommand");
  }
  return false;
}
