import CustomCommandsDB from "../providers/CustomCommands.Database";
import GlobalDB from "../../../common/providers/Global.Database";
import discord from "../../../common/utils/discord/discord";
import ICustomCommand from "../interfaces/ICustomCommand";
import Time from "../../../common/utils/Time";
import TextCommandManager from "../../../common/managers/TextCommandManager";
import CustomCommandsModule from "../CustomCommandsModule";

export async function updateCommandList(): Promise<void> {
  const customCommandsDB = CustomCommandsDB.getInstance();
  const db = GlobalDB.getInstance();

  const commandListMessageId = db.getCommandListMessageId();
  const commandListChannelId = CustomCommandsModule.getInstance().config.customCommandListChannelId;

  const textCommandManager = TextCommandManager.getInstance();
  const hardcodedCommands = textCommandManager.getCommands().filter((value) => value.prefix == CustomCommandsModule.getInstance().config.prefix);
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
  let output = `**Custom Commands (${commands.length} commands)**\n`;
  const prefix = CustomCommandsModule.getInstance().config.prefix;

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    output += `${prefix}${command.name}\n`;
  }
  return output;
}
