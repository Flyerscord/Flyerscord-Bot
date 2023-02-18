import { CommandInteraction, PermissionsBitField } from "discord.js";

import SlashCommand from "../models/SlashCommand";

export default class RoleAllAssignCommand extends SlashCommand {
  constructor() {
    super("roleassign", "Give the specified role to all members of the server");

    this.data
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
      .addRoleOption((option) =>
        option.setName("role").setDescription("The role to assign to everyone").setRequired(true)
      );
  }

  async execute(interaction: CommandInteraction): Promise<void> {
    interaction.reply({ content: "Pong", ephemeral: true });
  }
}
