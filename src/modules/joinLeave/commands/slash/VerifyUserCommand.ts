import { AdminSlashCommand } from "@common/models/SlashCommand";
import ConfigManager from "@common/managers/ConfigManager";
import discord from "@common/utils/discord/discord";
import { bold, ChatInputCommandInteraction, userMention } from "discord.js";
import JoinLeaveDB from "../../db/JoinLeaveDB";
import JoinImageGenerator from "../../utils/JoinImageGenerator";
import Stumper from "stumper";

export default class VerifyUserCommand extends AdminSlashCommand {
  constructor() {
    super("verifyuser", "Manually mark a user as verified", { ephemeral: true });

    this.data
      .addUserOption((option) => option.setName("user").setDescription("The user to manually verify").setRequired(true))
      .addBooleanOption((option) =>
        option.setName("sendwelcomemessage").setDescription("Whether to send a welcome message to the general channel").setRequired(false),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = this.getUserParamValue(interaction, "user");
    const sendWelcomeMessage = this.getBooleanParamValue(interaction, "sendwelcomemessage", true);

    const member = await discord.members.getMember(user.id, true);
    if (!member) {
      await this.replies.reply(`User ${userMention(user.id)} is not in the server!`);
      return;
    }

    const db = new JoinLeaveDB();

    const notVerifiedUser = await db.getNotVerifiedUser(user.id);
    if (!notVerifiedUser) {
      await this.replies.reply(`User ${userMention(user.id)} is already verified!`);
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
      const message = `${userMention(member.id)}\nWelcome${leftUser !== undefined ? " back" : ""} to ${bold("Go Flyers")}!! Rule #1: Fuck the Pens!`;
      const joinImageGenerator = new JoinImageGenerator(username, member.displayAvatarURL(), discord.members.getNumberOfMembers());
      let joinPhoto: Buffer;
      try {
        joinPhoto = await joinImageGenerator.getImage();
        await discord.messages.sendMessageAndImageBufferToChannel(ConfigManager.getInstance().getConfig("JoinLeave").channelId, message, joinPhoto);
      } catch (error) {
        Stumper.caughtError(error, "joinLeave:VerifyUserCommand");
      }
    }

    const adminNotificationChannelId = ConfigManager.getInstance().getConfig("JoinLeave").joinLeaveAdminNotificationChannelId;
    void discord.messages.sendMessageToChannel(adminNotificationChannelId, `${userMention(user.id)} has been manually verified!`);

    await this.replies.reply(`User ${userMention(user.id)} has been verified!`);

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
