import { AdminSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import ConfigManager from "@common/managers/ConfigManager";
import discord from "@common/utils/discord/discord";
import { ChatInputCommandInteraction, User } from "discord.js";
import JoinLeaveDB from "../../db/JoinLeaveDB";
import { sendCaptcha } from "../../utils/Captcha";

export default class CaptchaUserCommand extends AdminSlashCommand {
  constructor() {
    super("captchauser", "Mark user as not verified and send a captcha", { ephemeral: true });

    this.data
      .addUserOption((option) => option.setName("user").setDescription("The user to send the captcha to").setRequired(true))
      .addStringOption((option) => option.setName("confirmation").setDescription("Enter 'CONFIRM' to confirm").setRequired(true));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = this.getParamValue(interaction, PARAM_TYPES.USER, "user") as User;
    const confirmation = this.getParamValue(interaction, PARAM_TYPES.STRING, "confirmation") as string;

    if (confirmation != "CONFIRM") {
      await this.replies.reply("Incorrect confirmation! Please try again.");
      return;
    }

    const member = await discord.members.getMember(user.id, true);
    if (!member) {
      await this.replies.reply(`User ${user.id} is not in the server!`);
      return;
    }

    const db = new JoinLeaveDB();

    const notVerifiedUser = await db.getNotVerifiedUser(user.id);
    if (notVerifiedUser) {
      await this.replies.reply(`User ${user.id} is already not verified!`);
      return;
    }

    const notVerifiedRoleId = ConfigManager.getInstance().getConfig("JoinLeave").notVerifiedRoleId;
    await discord.roles.addRoleToUser(member, notVerifiedRoleId);
    await db.addNotVerifiedUser(user.id);
    await sendCaptcha(user);

    await this.replies.reply(`User ${user.id} has been marked as not verified and a captcha has been sent!`);
  }
}
