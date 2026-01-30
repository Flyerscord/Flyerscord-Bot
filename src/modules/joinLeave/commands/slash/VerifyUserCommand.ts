import { AdminSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import ConfigManager from "@common/managers/ConfigManager";
import discord from "@common/utils/discord/discord";
import { bold, ChatInputCommandInteraction, User } from "discord.js";
import JoinLeaveDB from "../../db/JoinLeaveDB";
import JoinImageGenerator from "../../utils/JoinImageGenerator";
import Stumper from "stumper";

export default class VerifyUserCommand extends AdminSlashCommand {
  constructor() {
    super("verifyuser", "Manually mark a user as verified", { ephemeral: true });

    this.data
      .addUserOption((option) => option.setName("user").setDescription("The user to manually verify").setRequired(true))
      .addBooleanOption((option) =>
        option.setName("sendWelcomeMessage").setDescription("Whether to send a welcome message to the general channel").setRequired(false),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = this.getParamValue(interaction, PARAM_TYPES.USER, "user") as User;
    const sendWelcomeMessage = (this.getParamValue(interaction, PARAM_TYPES.BOOLEAN, "sendWelcomeMessage") as boolean | null) ?? true;

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

    const leftUser = await db.getLeftUser(user.id);

    // Send the welcome message
    if (sendWelcomeMessage) {
      const username = member.displayName || member.user.username;
      const message = `<@${member.id}>\nWelcome${leftUser !== undefined ? " back" : ""} to the ${bold("Go Flyers")}!! Rule #1: Fuck the Pens!`;
      const joinImageGenerator = new JoinImageGenerator(username, member.displayAvatarURL(), discord.members.getNumberOfMembers());
      let joinPhoto: Buffer;
      try {
        joinPhoto = await joinImageGenerator.getImage();
      } catch (error) {
        Stumper.caughtError(error, "joinLeave:VerifyUserCommand");
        return;
      }
      await discord.messages.sendMessageAndImageBufferToChannel(ConfigManager.getInstance().getConfig("JoinLeave").channelId, message, joinPhoto);
    }

    const adminNotificationChannelId = ConfigManager.getInstance().getConfig("JoinLeave").joinLeaveAdminNotificationChannelId;
    void discord.messages.sendMessageToChannel(adminNotificationChannelId, `<@${user.id}> has been manually verified!`);

    await this.replies.reply(`User <@${user.id}> has been verified!`);

    if (leftUser) {
      Stumper.info(`User ${user.id} was previously left, adding their roles back`, "joinLeave:VerifyUserCommand");
      const roles = leftUser.roles;
      for (const role of roles) {
        if (role === notVerifiedRoleId) {
          Stumper.warning(`User ${user.id} had previously left with the not verified role, skipping`, "joinLeave:VerifyUserCommand");
          continue;
        }
        Stumper.info(`Adding back role ${role} to user ${user.id}`, "joinLeave:VerifyUserCommand");
        await discord.roles.addRoleToUser(member, role);
      }
      await db.deleteLeftUser(user.id);
    }
  }
}
