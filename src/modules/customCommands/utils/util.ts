import CustomCommandsDB from "../providers/CustomCommands.Database";
import CacheDB from "../../../common/providers/Cache.Database";
import Config from "../../../common/config/Config";
import discord from "../../../common/util/discord/discord";

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
