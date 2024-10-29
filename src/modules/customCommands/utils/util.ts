import CustomCommandsDB from "../providers/CustomCommands.Database.js";
import GlobalDB from "../../../common/providers/Global.Database.js";
import Config from "../../../common/config/Config.js";
import discord from "../../../common/utils/discord/discord.js";
import ICustomCommand from "../interfaces/ICustomCommand.js";
import Time from "../../../common/utils/Time.js";

export async function updateCommandList(): Promise<void> {
  const customCommandsDB = CustomCommandsDB.getInstance();
  const db = GlobalDB.getInstance();

  const commandListMessageId = db.getCommandListMessageId();
  const commandListChannelId = Config.getConfig().customCommandListChannelId;

  const commands = customCommandsDB.getAllCommands();
  const commandListMessage = createCommandListMessage(commands);

  if (commandListMessageId == "") {
    // The command list message does not exist and need to be made
    const message = await discord.messages.sendMessageToChannel(commandListChannelId, commandListMessage);
    if (message) {
      db.setCommandListMessageId(message.id);
    }
  } else {
    discord.messages.updateMessageWithText(commandListChannelId, commandListMessageId, commandListMessage);
  }
}

function createCommandListMessage(commands: Array<ICustomCommand>): string {
  const date = Time.getCurrentDate();
  let output = `**Commands as of ${date} (${commands.length} commands)\n`;
  const prefix = Config.getConfig().prefix;

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    output += `${prefix}${command.name}\n`;
  }
  return output;
}
