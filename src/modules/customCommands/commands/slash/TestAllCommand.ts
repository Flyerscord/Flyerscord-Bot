import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "../../../../common/models/SlashCommand";
import CustomCommandsDB from "../../providers/CustomCommands.Database";

import discord from "../../../../common/utils/discord/discord";

export default class TestAllCommand extends AdminSlashCommand {
  constructor() {
    super("customtest", "Runs all of the custom commands to test the links");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
    const db = CustomCommandsDB.getInstance();
    const commands = db.getAllCommands();

    const channel = interaction.channel;

    if (channel) {
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        await discord.messages.sendMessageToChannel(channel.id, command.name);
        await discord.messages.sendMessageToChannel(channel.id, command.text);
      }
      interaction.editReply({ content: "Command test complete" });
    } else {
      interaction.editReply({ content: "Error testing commands" });
    }
  }
}
