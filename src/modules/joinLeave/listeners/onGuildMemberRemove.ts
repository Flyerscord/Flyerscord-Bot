import { AttachmentBuilder, bold, italic } from "discord.js";
import ClientManager from "@common/managers/ClientManager";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";
import ConfigManager from "@common/managers/ConfigManager";
import JoinLeaveDB from "../db/JoinLeaveDB";
import MyAuditLog from "@common/utils/MyAuditLog";
import Time from "@common/utils/Time";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildMemberRemove", async (member) => {
    const username = member.displayName || member.user.username;

    let leftBeforeStr = "";
    const leftBefore = await MyAuditLog.getAuditLogsByUserAndAction("JoinLeave", member.user.id, "userLeft");
    if (leftBefore.length > 0) {
      leftBeforeStr = `${italic(bold("again"))}`;
    }

    let message = `${bold(username)} has just left the server${leftBeforeStr}! Typical Pens fan ${bold(username)}...`;

    const kickedForNotVerifiedALs = await MyAuditLog.getAuditLogsByUserAndAction("JoinLeave", member.user.id, "kickedNotVerifiedUser");
    if (kickedForNotVerifiedALs.length > 0) {
      for (const al of kickedForNotVerifiedALs) {
        const timeSinceKick = Time.timeSince(al.timestamp.getTime());
        // If the user was kicked for not verified within the last minute
        if (timeSinceKick <= 60_000) {
          message = `${bold(username)} has just left the server${leftBeforeStr}! Guess they don't know what a puck is...`;
          break;
        }
      }
    }

    const notVerifiedRoleId = ConfigManager.getInstance().getConfig("JoinLeave").notVerifiedRoleId;
    if (!discord.roles.userHasRole(member, notVerifiedRoleId)) {
      await discord.messages.sendMessageAndAttachmentToChannel(
        ConfigManager.getInstance().getConfig("JoinLeave").channelId,
        message,
        new AttachmentBuilder("https://i.imgur.com/dDrkXV6.gif"),
      );
    } else {
      const adminNotificationChannelId = ConfigManager.getInstance().getConfig("JoinLeave").joinLeaveAdminNotificationChannelId;
      void discord.messages.sendMessageToChannel(adminNotificationChannelId, message);
    }
    Stumper.info(`User ${username} has left the server!`, "joinLeave:onGuildMemberRemove");

    const db = new JoinLeaveDB();
    let notVerifiedUser = await db.getNotVerifiedUser(member.user.id);
    if (notVerifiedUser) {
      if (notVerifiedUser.threadId) {
        await discord.threads.deleteThread(notVerifiedUser.threadId, "User left the server before answering the captcha");
      }
      await db.deleteNotVerifiedUser(member.user.id);
    }

    const everyoneRoleId = discord.guilds.getGuild()?.roles.everyone.id;
    const roles = discord.roles.getUserRoles(member).filter((role) => role !== everyoneRoleId);
    await db.addLeftUser(member.user.id, roles);

    void MyAuditLog.createAuditLog("JoinLeave", {
      action: "userLeft",
      userId: member.user.id,
      details: {
        roles,
      },
    });
  });
};
