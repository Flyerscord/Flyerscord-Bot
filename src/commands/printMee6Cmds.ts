import { CommandInteraction, PermissionsBitField } from "discord.js";

import SlashCommand from "../models/SlashCommand";

//TODO: Needs additional testing.  Might need to stay as a text command
export default class PrintMee6CmdsCommand extends SlashCommand {
  constructor() {
    super("mee6cmds", "Convert the copied list of commands from the Mee6 website to an embed");

    this.data
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
      .addStringOption((option) =>
        option.setName("list").setDescription("List of commands from the Mee6 website").setRequired(true)
      )
      .addAttachmentOption((option) => option);
  }

  async execute(interaction: CommandInteraction): Promise<void> {
    interaction.reply({ content: "Pong", ephemeral: true });
  }
}
