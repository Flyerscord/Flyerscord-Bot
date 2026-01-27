import { ChatInputCommandInteraction, Role } from "discord.js";
import { AdminSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import discord from "@common/utils/discord/discord";

export default class RoleAllAssignCommand extends AdminSlashCommand {
  constructor() {
    super("roleallassign", "Assign the role to all members of the server", { ephemeral: true });

    this.data
      .addRoleOption((option) => option.setName("role").setDescription("The role to assign to everyone").setRequired(true))
      .addBooleanOption((option) =>
        option.setName("onlynonrole").setDescription("Whether or not to give the role to only members that don't have a role"),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const role: Role = this.getParamValue(interaction, PARAM_TYPES.ROLE, "role");
    const onlyNoRole: boolean = this.getParamValue(interaction, PARAM_TYPES.BOOLEAN, "onlynonrole") || false;

    const members = await discord.members.getMembers();
    if (!members) {
      await this.replies.reply("Error retreiving the guild members");
      return;
    }

    members.forEach(async (member) => {
      if (onlyNoRole && discord.roles.userHasAnyRole(member)) {
        await discord.roles.addRoleToUser(member, role.id);
      } else if (!onlyNoRole) {
        await discord.roles.addRoleToUser(member, role.id);
      }
    });

    if (onlyNoRole) {
      await this.replies.reply(`Adding the following role to users that do not have a role: ${role.name}`);
    } else {
      await this.replies.reply(`Adding the following role to all users: ${role.name}`);
    }
  }
}
