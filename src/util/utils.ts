import Config from "../config/Config";
import CacheDB from "../providers/Cache.Database";
import CustomCommandsDB from "../providers/CustomCommands.Database";
import discord from "./discord/discord";

// Min and Max included
export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export async function updateCommandList(): Promise<void> {
  const customCommandsDB = CustomCommandsDB.getInstance();
  const cacheDB = CacheDB.getInstance();

  const commandListMessageId = cacheDB.getCommandListMessageId();
  const commandListChannelId = Config.getConfig().customCommandListChannelId;

  const commands = customCommandsDB.getAllCommands();
  const commandListMessage = discord.messages.createCommandListMessage(commands);

  if (commandListMessageId == "") {
    // The command list message does not exist and need to be made
    const message = await discord.messages.sendMessageToChannel(commandListChannelId, commandListMessage);
    if (message) {
      cacheDB.setCommandListMessageId(message.id);
    }
  } else {
    discord.messages.updateMessageWithText(commandListChannelId, commandListMessageId, commandListMessage);
  }
}

export async function sleepMs(milliseconds: number): Promise<void> {
  return await new Promise((r) => setTimeout(r, milliseconds));
}

export async function sleepSec(seconds: number): Promise<void> {
  return await sleepMs(seconds * 1000);
}
