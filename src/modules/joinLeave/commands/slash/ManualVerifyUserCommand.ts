import { AdminSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import ConfigManager from "@common/managers/ConfigManager";
import discord from "@common/utils/discord/discord";
import { ChatInputCommandInteraction, User } from "discord.js";
import JoinLeaveDB from "../../db/JoinLeaveDB";

export default class ManualVerifyUserCommand extends AdminSlashCommand {
  constructor() {
    super("verifyuser", "Manually mark a user as verified", { ephemeral: true });

    this.data.addUserOption((option) => option.setName("user").setDescription("The user to manually verify").setRequired(true));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = this.getParamValue(interaction, PARAM_TYPES.USER, "user") as User;

    const member = await discord.members.getMember(user.id, true);
    if (!member) {
      await this.replies.reply(`User <@${user.id}> is not in the server!`);
      return;
    }

    const db = new JoinLeaveDB();

    const notVerifiedUser = await db.getNotVerifiedUser(user.id);
    if (!notVerifiedUser) {
      await this.replies.reply(`User <@${user.id}> is already verified!`);
      return;
    }

    const notVerifiedRoleId = ConfigManager.getInstance().getConfig("JoinLeave").notVerifiedRoleId;
    await discord.roles.removeRoleFromUser(member, notVerifiedRoleId);
    await db.deleteNotVerifiedUser(user.id);

    if (notVerifiedUser.threadId) {
      await discord.threads.deleteThread(notVerifiedUser.threadId, "User verified");
    }

    await this.replies.reply(`User <@${user.id}> has been verified!`);
  }
}
