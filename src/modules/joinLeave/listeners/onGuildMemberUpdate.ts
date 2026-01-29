import ClientManager from "@common/managers/ClientManager";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";
import ConfigManager from "@common/managers/ConfigManager";
import { sendCaptcha } from "../utils/Captcha";
import JoinLeaveDB from "../db/JoinLeaveDB";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildMemberUpdate", async (oldMember, newMember) => {
    const db = new JoinLeaveDB();
    const user = newMember.user;

    // Skip captcha for bots
    if (user.bot) {
      Stumper.info(`User ${user.id} is a bot, skipping captcha`, "joinLeave:onGuildMemberAdd");
      return;
    }

    if (oldMember.pending && !newMember.pending) {
      const notVerifiedRoleId = ConfigManager.getInstance().getConfig("JoinLeave").notVerifiedRoleId;

      await db.addNotVerifiedUser(user.id);

      await discord.roles.addRoleToUser(newMember, notVerifiedRoleId);

      await sendCaptcha(user);
    }
  });
};
