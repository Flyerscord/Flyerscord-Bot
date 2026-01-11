import { Client, Message } from "discord.js";

import TextCommand from "../models/TextCommand";
import Stumper from "stumper";
import ConfigManager from "@common/managers/ConfigManager";

export default (client: Client): void => {
  client.on("messageCreate", async (message: Message) => {
    if (await checkForNormalTextCommand(message)) return;
  });
};

async function checkForNormalTextCommand(message: Message): Promise<boolean> {
  const configManager = ConfigManager.getInstance();
  const prefix = configManager.getConfig("CustomCommands")?.prefix ?? "!";
  const adminPrefix = configManager.getConfig("Common").adminPrefix;
  if (message.author.bot) return false;
  if (!message.channel.isTextBased()) return false;
  if (!message.content.startsWith(prefix) && !message.content.startsWith(adminPrefix)) return false;

  const messageArray = message.content.split(" ");
  let command = messageArray[0];
  const args = messageArray.slice(1);

  const textCmd: TextCommand = message.client.textCommands.get(command);
  try {
    if (textCmd) {
      Stumper.info(`Command ${command} called by user ${message.author.username}!`, "common:onMessageCreate:checkForNormalTextCommand");
      await textCmd.run(message, args);
      return true;
    } else {
      Stumper.debug(`Command ${command} not found!`, "common:onMessageCreate:checkForNormalTextCommand");
    }
  } catch (err) {
    Stumper.error(
      `Error parsing normal text command message. Message content: ${message.content}`,
      "common:onMessageCreate:checkForNormalTextCommand",
    );
    Stumper.caughtError(err, "common:onMessageCreate:checkForNormalTextCommand");
  }
  return false;
}
