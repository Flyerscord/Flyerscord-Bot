import { Message } from "discord.js";

import Stumper from "stumper";
import CustomCommandsDB from "../providers/CustomCommands.Database";
import Config from "../../../common/config/Config";
import ClientManager from "../../../common/managers/ClientManager";
import discord from "../../../common/utils/discord/discord";
import CommandImporter from "../utils/CommandImporter";

export default (): void => {
  ClientManager.getInstance().client.on("messageCreate", async (message: Message) => {
    if (checkCommandImport(message)) return;
    if (checkForCustomTextCommand(message)) return;
  });
};

function checkForCustomTextCommand(message: Message): boolean {
  const prefix = Config.getConfig().prefix.normal;
  if (message.author.bot) return false;
  if (!message.channel.isTextBased()) return false;
  if (!message.content.startsWith(prefix)) return false;

  const messageArray = message.content.split(" ");
  const command = messageArray[0].replace(prefix, "").toLowerCase();

  const db = CustomCommandsDB.getInstance();
  const customCommand = db.getCommand(command);
  if (customCommand) {
    Stumper.info(`Executing custom command ${customCommand.name}.`, "customCommands:onMessageCreate:checkForCustomTextCommand");
    discord.messages.sendMessageToChannel(message.channel.id, customCommand.text);
    return true;
  } else if (message.client.textCommands.hasAny(command)) {
    // Command is a hardcoded text command and will be caught by the normal text command check
  } else {
    Stumper.debug(`Custom Command ${command} not found!`, "customCommands:onMessageCreate:checkForCustomTextCommand");
  }
  return false;
}

function checkCommandImport(message: Message): boolean {
  if (!message.channel.isTextBased()) return false;

  const importer = CommandImporter.getInstance();

  if (!importer.isEnabled()) return false;
  if (importer.getChannelId() != message.channel.id) return false;
  if (message.author.id != importer.getUserId() && message.author.id != importer.getBotId()) return false;

  if (message.author.id == importer.getUserId()) {
    importer.setNewCommandName(message.content);
  } else {
    importer.setNewCommandText(message.content);
  }

  return true;
}
