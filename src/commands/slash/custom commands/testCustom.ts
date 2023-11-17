import { ChatInputCommandInteraction } from "discord.js";

import { AdminSlashCommand } from "../../../models/SlashCommand";
import CustomCommandsDB from "../../../providers/CustomCommands.Database";

export default class AddCustomCommand extends AdminSlashCommand {
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
        channel.send({ content: command.name });
        channel.send({ content: command.text });
      }
      interaction.reply({ content: "Command test complete", ephemeral: true });
    } else {
      interaction.reply({ content: "Error testing commands", ephemeral: true });
    }
  }
}
