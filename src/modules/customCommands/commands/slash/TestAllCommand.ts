import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "../../../../common/models/SlashCommand";
import CustomCommandsDB from "../../providers/CustomCommands.Database";

import discord from "../../../../common/utils/discord/discord";
import Config from "../../../../common/config/Config";
import { sleepSec } from "../../../../common/utils/sleep";

export default class TestAllCommand extends AdminSlashCommand {
  constructor() {
    super("customtest", "Runs all of the custom commands to test the links");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const db = CustomCommandsDB.getInstance();
    let commands = db.getAllCommands();

    commands = commands.sort((a, b) => a.name.localeCompare(b.name));

    const channel = interaction.channel;

    if (channel) {
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        await discord.messages.sendMessageToChannel(channel.id, `\`${Config.getConfig().prefix.normal}${command.name}\``);
        await discord.messages.sendMessageToChannel(channel.id, command.text);

        await sleepSec(1);
      }
      interaction.editReply({ content: "Command test complete" });
    } else {
      interaction.editReply({ content: "Error testing commands" });
    }
  }
}
