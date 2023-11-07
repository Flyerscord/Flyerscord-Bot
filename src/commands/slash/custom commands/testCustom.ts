import { ChatInputCommandInteraction } from "discord.js";

import { AdminSlashCommand } from "../../../models/SlashCommand";
import CustomCommandsDB from "../../../providers/CustomCommands.Database";
import Config from "../../../config/Config";

export default class AddCustomCommand extends AdminSlashCommand {
  constructor() {
    super("testcustom", "Runs all of the custom commands to test the links");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const db = CustomCommandsDB.getInstance();
    const prefix = Config.getConfig().prefixes.custom;

    const commands = db.getAllCommands();

    const now = new Date();
    const mm = now.getMonth() + 1;
    const dd = now.getDate();
    const yy = now.getFullYear().toString().slice(-2);
    let output = `**Commands as of ${mm}/${dd}/${yy} (${commands.length} commands)`;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      output = `${output}\n${prefix}${command.name}`;
    }

    const channel = interaction.channel;
    if (channel) {
      channel.send({ content: output });
      interaction.reply({ content: "Command list sent", ephemeral: true });
    } else {
      interaction.reply({ content: "Error sending command list", ephemeral: true });
    }
  }
}
