import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "../../../../common/models/SlashCommand";
import CustomCommandsDB from "../../providers/CustomCommands.Database";

import discord from "../../../../common/utils/discord/discord";

export default class TestAllCommand extends AdminSlashCommand {
  constructor() {
    super("testcustom", "Runs all of the custom commands to test the links");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const db = CustomCommandsDB.getInstance();
    const commands = db.getAllCommands();

    const channel = interaction.channel;

    if (channel) {
      interaction.deferred = true;
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        discord.messages.sendMessageToChannel(channel.id, command.name);
        discord.messages.sendMessageToChannel(channel.id, command.text);
      }
      interaction.reply({ content: "Command test complete", ephemeral: true });
    } else {
      interaction.reply({ content: "Error testing commands", ephemeral: true });
    }
  }
}
