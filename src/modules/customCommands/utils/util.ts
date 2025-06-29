import GlobalDB from "../../../common/providers/Global.Database";
import discord from "../../../common/utils/discord/discord";
import ICustomCommand from "../interfaces/ICustomCommand";
import Time from "../../../common/utils/Time";
import TextCommandManager from "../../../common/managers/TextCommandManager";
import { Message } from "discord.js";
import ConfigManager from "@common/config/ConfigManager";

export async function updateCommandList(allCommands: ICustomCommand[]): Promise<void> {
  const db = GlobalDB.getInstance();

  const commandListMessageIds = db.getCommandListMessageIds();

  const config = ConfigManager.getInstance().getConfig("CustomCommands");
  const commandListChannelId = config.customCommandListChannelId;

  const textCommandManager = TextCommandManager.getInstance();
  const hardcodedCommands = textCommandManager.getCommands().filter((value) => value.prefix == config.prefix);
  const hardcodedCommandsCustom: ICustomCommand[] = hardcodedCommands.map((command) => {
    return {
      name: command.command,
      text: "",
      createdBy: "System",
      createdOn: Time.getCurrentTime(),
      history: [],
    };
  });

  let commands = [...hardcodedCommandsCustom, ...allCommands];
  commands = commands.sort((a, b) => a.name.localeCompare(b.name));
  const commandListMessages = createCommandListMessages(commands);

  // Check on status of all command list messages
  let allCommandListMessagesExist = commandListMessageIds.length > 0;
  let existingCommandMessages: Message[] = [];
  for (const commandListMessageId of commandListMessageIds) {
    const message = await discord.messages.getMessage(commandListChannelId, commandListMessageId);
    if (!message) {
      allCommandListMessagesExist = false;
    } else {
      existingCommandMessages.push(message);
    }
  }

  if (!allCommandListMessagesExist) {
    // Delete all existing command list messages, if any
    for (const message of existingCommandMessages) {
      await message.delete();
    }
    db.removeAllCommandListMessageIds();

    // The command list message does not exist and need to be made
    for (const commandListMessage of commandListMessages) {
      const message = await discord.messages.sendMessageToChannel(commandListChannelId, commandListMessage);
      if (message) {
        db.addCommandListMessageId(message.id);
      }
    }
  } else {
    if (commandListMessages.length > existingCommandMessages.length) {
      for (const message of existingCommandMessages) {
        await message.delete();
      }
      db.removeAllCommandListMessageIds();

      for (let i = 0; i < commandListMessages.length; i++) {
        const message = await discord.messages.sendMessageToChannel(commandListChannelId, commandListMessages[i]);
        if (message) {
          db.addCommandListMessageId(message.id);
        }
      }
    } else if (commandListMessages.length < existingCommandMessages.length) {
      for (let i = 0; i < existingCommandMessages.length; i++) {
        if (i >= commandListMessages.length) {
          await existingCommandMessages[i].delete();
          db.removeCommandListMessageId(existingCommandMessages[i].id);
        } else {
          existingCommandMessages[i].edit(commandListMessages[i]);
        }
      }
    } else {
      for (let i = 0; i < existingCommandMessages.length; i++) {
        existingCommandMessages[i].edit(commandListMessages[i]);
      }
    }
  }
}

export function createCommandListMessages(commands: ICustomCommand[]): string[] {
  let output = `**Custom Commands (${commands.length} commands)**\n`;
  const prefix = ConfigManager.getInstance().getConfig("CustomCommands").prefix;

  let outputStrings: string[] = [];

  let textLength = output.length;

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    const commandText = `${prefix}${command.name}\n`;

    if (textLength + commandText.length > 2000) {
      outputStrings.push(output);
      output = "";
      textLength = 0;
    }

    output += commandText;
    textLength += commandText.length;
  }

  outputStrings.push(output);
  return outputStrings;
}
