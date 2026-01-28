import { AttachmentBuilder, bold } from "discord.js";
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

    let message = `${bold(username)} has just left the server! Typical Pens fan ${bold(username)}...`;

    const kickedForNotVerifiedALs = await MyAuditLog.getAuditLogsByUserAndAction("JoinLeave", member.user.id, "kickedNotVerifiedUser");
    if (kickedForNotVerifiedALs.length > 0) {
      for (const al of kickedForNotVerifiedALs) {
        const timeSinceKick = Time.timeSince(al.timestamp.getTime());
        // If the user was kicked for not verified within the last minute
        if (timeSinceKick <= 60_000) {
          message = `${bold(username)} has just left the server! Guess they don't know what a puck is...`;
          break;
        }
      }
    }

    await discord.messages.sendMessageAndAttachmentToChannel(
      ConfigManager.getInstance().getConfig("JoinLeave").channelId,
      message,
      new AttachmentBuilder("https://i.imgur.com/dDrkXV6.gif"),
    );
    Stumper.info(`User ${username} has left the server!`, "joinLeave:onGuildMemberRemove");

    const db = new JoinLeaveDB();
    let notVerifiedUser = await db.getNotVerifiedUser(member.user.id);
    if (notVerifiedUser) {
      if (notVerifiedUser.threadId) {
        await discord.threads.deleteThread(notVerifiedUser.threadId, "User left the server before answering the captcha");
      }
      await db.deleteNotVerifiedUser(member.user.id);
    }

    const roles = discord.roles.getUserRoles(member);
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
