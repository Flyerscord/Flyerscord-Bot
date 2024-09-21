import { Message } from "discord.js";

import Stumper from "stumper";
import CustomCommandsDB from "../providers/CustomCommands.Database";
import Config from "../../../common/config/Config";
import ClientManager from "../../../common/managers/ClientManager";
import discord from "../../../common/utils/discord/discord";

export default (): void => {
  ClientManager.getInstance().client.on("messageCreate", async (message: Message) => {
    if (checkForCustomTextCommand(message)) return;
  });
};

function checkForCustomTextCommand(message: Message): boolean {
  const prefix = Config.getConfig().prefixes.normal;
  if (message.author.bot) return false;
  if (!message.channel.isTextBased()) return false;
  if (!message.content.startsWith(prefix)) return false;

  const messageArray = message.content.split(" ");
  const command = messageArray[0];

  const db = CustomCommandsDB.getInstance();
  const customCommand = db.getCommand(command);
  if (customCommand) {
    Stumper.info(`Executing custom command ${customCommand.name}.`, "checkForCustomTextCommand");
    discord.messages.sendMessageToChannel(message.channel.id, customCommand.text);
    return true;
  } else {
    Stumper.warning(`Custom Command ${command} not found!`, "checkForCustomTextCommand");
  }
  return false;
}
