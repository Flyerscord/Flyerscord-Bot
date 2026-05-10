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
    let details: { roles?: string[]; timedOutFor?: number } = {};
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
        const hoursOld = Time.timeSince(user.createdTimestamp) / 1000 / 60 / 60;
        if (ConfigManager.getInstance().getConfig("JoinLeave").enableAdminPingOnNewUserJoin) {
          void discord.messages.sendMessageToChannel(
            adminNotificationChannelId,
            `${roleMention(adminRoleId)}\n${userMention(user.id)} has joined the server, but their account is ${hoursOld.toFixed(2)} hours old!`,
          );
        } else {
          void discord.messages.sendMessageToChannel(
            adminNotificationChannelId,
            `${userMention(user.id)} has joined the server, but their account is ${hoursOld.toFixed(2)} hours old!`,
          );
        }

        const MAX_TIMEOUT_MS = 28 * 24 * 60 * 60 * 1000;
        details.timedOutFor = Math.min(brandNewAccountThreshold * 24 * 60 * 60 * 1000 - Time.timeSince(user.createdTimestamp), MAX_TIMEOUT_MS);
        // Timeout user for the amount of time they have left until they are no longer brand new
        await member.timeout(details.timedOutFor, "JoinLeave: User is brand new");
        Stumper.info(
          `User ${username} has joined the server, but their account is brand new! Timing out them for ${(details.timedOutFor / 1000 / 60 / 60).toFixed(2)} hours!`,
          "joinLeave:onGuildMemberAdd:onGuildMemberAdd",
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
