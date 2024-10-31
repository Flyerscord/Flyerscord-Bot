import CustomCommandsDB from "../providers/CustomCommands.Database";
import GlobalDB from "../../../common/providers/Global.Database";
import Config from "../../../common/config/Config";
import discord from "../../../common/utils/discord/discord";
import ICustomCommand from "../interfaces/ICustomCommand";
import Time from "../../../common/utils/Time";
import TextCommandManager from "../../../common/managers/TextCommandManager";

export async function updateCommandList(): Promise<void> {
  const customCommandsDB = CustomCommandsDB.getInstance();
  const db = GlobalDB.getInstance();

  const commandListMessageId = db.getCommandListMessageId();
  const commandListChannelId = Config.getConfig().customCommandListChannelId;

  const textCommandManager = TextCommandManager.getInstance();
  const hardcodedCommands = textCommandManager.getCommands().filter((value) => value.prefix == Config.getConfig().prefix.normal);
  const hardcodedCommandsCustom: ICustomCommand[] = hardcodedCommands.map((command) => {
    return {
      name: command.command,
      text: "",
      createdBy: "System",
      createdOn: Time.getCurrentTime(),
      history: [],
    };
  });

  let commands = [...hardcodedCommandsCustom, ...customCommandsDB.getAllCommands()];
  commands = commands.sort((a, b) => a.name.localeCompare(b.name));
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

function createCommandListMessage(commands: ICustomCommand[]): string {
  const date = Time.getCurrentDate();
  let output = `**Commands as of ${date} (${commands.length} commands)**\n`;
  const prefix = Config.getConfig().prefix.normal;

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    output += `${prefix}${command.name}\n`;
  }
  return output;
}
