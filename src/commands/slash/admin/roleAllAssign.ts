import { ChatInputCommandInteraction, Role } from "discord.js";

import { AdminSlashCommand, PARAM_TYPES } from "../../../models/SlashCommand";

export default class RoleAllAssignCommand extends AdminSlashCommand {
  constructor() {
    super("roleassign", "Give the specified role to all members of the server");

    this.data
      .addRoleOption((option) =>
        option.setName("role").setDescription("The role to assign to everyone").setRequired(true)
      )
      .addBooleanOption((option) =>
        option
          .setName("onlynorole")
          .setDescription("Whether or not to give the role to only members that dont have a role")
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const role: Role = this.getParamValue(interaction, PARAM_TYPES.ROLE, "role");
    const onlyNoRole: boolean = this.getParamValue(interaction, PARAM_TYPES.BOOLEAN, "onlyNoRole") || true;
    if (role) {
      const members = await interaction.guild?.members.fetch();
      if (!members) {
        interaction.reply({ content: "Error retreiving the guild members", ephemeral: true });
        return;
      }

      members.forEach((member) => {
        if (onlyNoRole && member.roles.cache.size == 0) {
          member.roles.add(role);
        } else if (!onlyNoRole) {
          member.roles.add(role);
        }
      });

      if (onlyNoRole) {
        interaction.reply({
          content: `Adding the following role to users that do not have a role: ${role.name}`,
          ephemeral: true,
        });
      } else {
        interaction.reply({ content: `Adding the following role to all users: ${role.name}`, ephemeral: true });
      }
    }
    interaction.reply({ content: "Error finding the role!", ephemeral: true });
  }
}
