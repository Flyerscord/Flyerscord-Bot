import ClientManager from "@common/managers/ClientManager";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";
import ConfigManager from "@common/managers/ConfigManager";
import JoinLeaveDB from "../db/JoinLeaveDB";
import MyAuditLog from "@common/utils/MyAuditLog";
import { roleMention, userMention } from "discord.js";
import Time from "@common/utils/Time";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildMemberAdd", async (member) => {
    let details: { roles?: string[] } = {};
    try {
      const db = new JoinLeaveDB();

      const leftUser = await db.getLeftUser(member.user.id);
      if (leftUser) {
        details.roles = leftUser.roles;
      }

      const username = member.displayName || member.user.username;
      const user = member.user;

      const adminNotificationChannelId = ConfigManager.getInstance().getConfig("JoinLeave").joinLeaveAdminNotificationChannelId;
      const brandNewAccountThreshold = ConfigManager.getInstance().getConfig("JoinLeave").brandNewAccountThreshold;
      if (user.createdTimestamp > Date.now() - brandNewAccountThreshold * 24 * 60 * 60 * 1000) {
        // Check if the account is brand new
        const adminRoleId = ConfigManager.getInstance().getConfig("Common").adminRoleId;
        Stumper.info(`User ${username} has joined the server, but their account is brand new!`, "joinLeave:onGuildMemberAdd:onGuildMemberAdd");
        const hoursOld = Time.timeSince(user.createdTimestamp) / 1000 / 60 / 60;
        void discord.messages.sendMessageToChannel(
          adminNotificationChannelId,
          `${roleMention(adminRoleId)}\n ${userMention(user.id)} has joined the server, but their account is ${hoursOld.toFixed(2)} hours old!`,
        );
      } else {
        Stumper.info(`User ${username} has joined the server!`, "joinLeave:onGuildMemberAdd:onGuildMemberAdd");
        void discord.messages.sendMessageToChannel(adminNotificationChannelId, `${userMention(user.id)} has joined the server!`);
      }

      // Captcha
      const notVerifiedRoleId = ConfigManager.getInstance().getConfig("JoinLeave").notVerifiedRoleId;

      await discord.roles.addRoleToUser(member, notVerifiedRoleId);
      await db.addNotVerifiedUser(user.id);
    } catch (error) {
      Stumper.caughtError(error, "joinLeave:onGuildMemberAdd:onGuildMemberAdd");
    } finally {
      void MyAuditLog.createAuditLog("JoinLeave", {
        action: "userJoined",
        userId: member.user.id,
        details,
      });
    }
  });
};
