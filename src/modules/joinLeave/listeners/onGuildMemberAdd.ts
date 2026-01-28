import { bold } from "discord.js";
import ClientManager from "@common/managers/ClientManager";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";
import JoinImageGenerator from "../utils/JoinImageGenerator";
import ConfigManager from "@common/managers/ConfigManager";
import { sendCaptcha } from "../utils/Captcha";
import JoinLeaveDB from "../db/JoinLeaveDB";
import MyAuditLog from "@common/utils/MyAuditLog";

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

      const message = `<@${member.id}>\nWelcome${leftUser !== undefined ? " back" : ""} to the ${bold("Go Flyers")}!! Rule #1: Fuck the Pens!`;
      const joinImageGenerator = new JoinImageGenerator(username, member.displayAvatarURL(), await discord.members.getNumberOfMembers());
      let joinPhoto: Buffer;
      try {
        joinPhoto = await joinImageGenerator.getImage();
      } catch (error) {
        Stumper.caughtError(error, "joinLeave:onGuildMemberAdd");
        return;
      }

      await discord.messages.sendMessageAndImageBufferToChannel(ConfigManager.getInstance().getConfig("JoinLeave").channelId, message, joinPhoto);
      Stumper.info(`User ${username} has joined the server!`, "joinLeave:onGuildMemberAdd");

      // User Captcha

      // Skip captcha for bots
      if (user.bot) {
        Stumper.info(`User ${user.id} is a bot, skipping captcha`, "joinLeave:onGuildMemberAdd");
        return;
      }

      const notVerifiedRoleId = ConfigManager.getInstance().getConfig("JoinLeave").notVerifiedRoleId;

      await db.addNotVerifiedUser(user.id);

      let roleAdded = await discord.roles.addRoleToUser(member, notVerifiedRoleId);
      if (!roleAdded) {
        Stumper.warning(`Failed to add not verified role to user ${user.id}, retrying...`, "joinLeave:onGuildMemberAdd");
        roleAdded = await discord.roles.addRoleToUser(member, notVerifiedRoleId);
      }

      if (!roleAdded) {
        const hasRole = discord.roles.userHasRole(member, notVerifiedRoleId);
        if (!hasRole) {
          Stumper.error(`Failed to add not verified role to user ${user.id} after retry, rolling back DB change`, "joinLeave:onGuildMemberAdd");
          await db.deleteNotVerifiedUser(user.id);
          return;
        }
      }

      await sendCaptcha(user);
    } catch (error) {
      Stumper.caughtError(error, "joinLeave:onGuildMemberAdd");
    } finally {
      void MyAuditLog.createAuditLog("JoinLeave", {
        action: "userJoined",
        userId: member.user.id,
        details,
      });
    }
  });
};
