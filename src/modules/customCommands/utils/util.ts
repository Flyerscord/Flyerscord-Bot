import CustomCommandsDB from "../providers/CustomCommands.Database";
import CacheDB from "../../../common/providers/Cache.Database";
import Config from "../../../common/config/Config";
import discord from "../../../common/utils/discord/discord";
import ICustomCommand from "../interfaces/ICustomCommand";
import Time from "../../../common/utils/Time";

export async function updateCommandList(): Promise<void> {
  const customCommandsDB = CustomCommandsDB.getInstance();
  const cacheDB = CacheDB.getInstance();

  const commandListMessageId = cacheDB.getCommandListMessageId();
  const commandListChannelId = Config.getConfig().customCommandListChannelId;

  const commands = customCommandsDB.getAllCommands();
  const commandListMessage = createCommandListMessage(commands);

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

function createCommandListMessage(commands: Array<ICustomCommand>): string {
  const date = Time.getCurrentDate();
  let output = `**Commands as of ${date} (${commands.length} commands)\n`;
  const prefix = Config.getConfig().prefixes.custom;

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    output += `${prefix}${command.name}\n`;
  }
  return output;
}
