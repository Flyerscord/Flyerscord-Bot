import { Message } from "discord.js";

import Stumper from "stumper";
import ClientManager from "@common/managers/ClientManager";
import discord from "@common/utils/discord/discord";
import CommandImporter from "../utils/CommandImporter";
import MyImageKit from "../utils/ImageKit";
import ConfigManager from "@common/managers/ConfigManager";
import CustomCommandsDB from "../db/CustomCommandsDB";

export default (): void => {
  ClientManager.getInstance().client.on("messageCreate", async (message: Message) => {
    if (await checkCommandImport(message)) return;
    if (await checkForCustomTextCommand(message)) return;
  });
};

async function checkForCustomTextCommand(message: Message): Promise<boolean> {
  const prefix = ConfigManager.getInstance().getConfig("CustomCommands").prefix;
  if (message.author.bot) return false;
  if (!message.channel.isTextBased()) return false;
  if (!message.content.startsWith(prefix)) return false;

  const messageArray = message.content.split(" ");
  const command = messageArray[0].replace(prefix, "").toLowerCase();

  const db = new CustomCommandsDB();
  const customCommand = await db.getCommand(command);
  if (customCommand) {
    let text = customCommand.text;

    const imageKit = MyImageKit.getInstance();

    if (imageKit.isImageKitUrl(text)) {
      const url = await imageKit.convertToProxyUrlIfNeeded(text);

      if (url) {
        text = url;
        Stumper.debug(`Converted image kit url to proxy url: ${text}`, "customCommands:onMessageCreate:checkForCustomTextCommand");
      }
    }

    Stumper.info(`Executing custom command ${customCommand.name}.`, "customCommands:onMessageCreate:checkForCustomTextCommand");

    void db.createAuditLog({
      action: "CustomCommandRan",
      userId: message.author.id,
      details: {
        command: customCommand.name,
        channelId: message.channelId,
        messageId: message.id,
      },
    });

    await discord.messages.sendMessageToChannel(message.channel.id, text);
    return true;
  } else if (message.client.textCommands.hasAny(command)) {
    // Command is a hardcoded text command and will be caught by the normal text command check
  } else {
    Stumper.debug(`Custom Command ${command} not found!`, "customCommands:onMessageCreate:checkForCustomTextCommand");
  }
  return false;
}

async function checkCommandImport(message: Message): Promise<boolean> {
  if (!message.channel.isTextBased()) return false;

  const importer = CommandImporter.getInstance();

  if (!importer.isEnabled()) return false;
  if (importer.getChannelId() != message.channel.id) return false;
  if (message.author.id != importer.getUserId() && message.author.id != importer.getBotId()) return false;

  if (message.author.id == importer.getUserId()) {
    importer.setNewCommandName(message.content);
  } else {
    await importer.setNewCommandText(message.content);
  }

  return true;
}
