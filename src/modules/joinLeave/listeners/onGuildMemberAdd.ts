import ClientManager from "@common/managers/ClientManager";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";
import ConfigManager from "@common/managers/ConfigManager";
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

      Stumper.info(`User ${username} has joined the server!`, "joinLeave:onGuildMemberAdd");

      const adminNotificationChannelId = ConfigManager.getInstance().getConfig("JoinLeave").joinLeaveAdminNotificationChannelId;
      void discord.messages.sendMessageToChannel(adminNotificationChannelId, `<@${user.id}> has joined the server!`);

      // Captcha
      const notVerifiedRoleId = ConfigManager.getInstance().getConfig("JoinLeave").notVerifiedRoleId;

      await discord.roles.addRoleToUser(member, notVerifiedRoleId);
      await db.addNotVerifiedUser(user.id);
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
