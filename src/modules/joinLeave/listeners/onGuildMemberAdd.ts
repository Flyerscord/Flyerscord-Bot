import { bold } from "discord.js";
import ClientManager from "@common/managers/ClientManager";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";
import JoinImageGenerator from "../utils/JoinImageGenerator";
import ConfigManager from "@common/managers/ConfigManager";
import { sendCaptcha } from "../utils/Captcha";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildMemberAdd", async (member) => {
    const username = member.displayName || member.user.username;
    const user = member.user;

    const message = `<@${member.id}>\nWelcome to the ${bold("Go Flyers")}!! Rule #1: Fuck the Pens!`;
    const joinImageGenerator = new JoinImageGenerator(username, member.displayAvatarURL(), await discord.members.getMemberJoinPosition(member));
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
    const notVerifiedRoleId = ConfigManager.getInstance().getConfig("JoinLeave").notVerifiedRoleId;

    try {
      await discord.roles.addRoleToUser(member, notVerifiedRoleId);
    } catch (error) {
      Stumper.error(`Error adding not verified role to user ${user.id}`, "joinLeave:onGuildMemberAdd");
      Stumper.caughtError(error, "joinLeave:onGuildMemberAdd");
    }

    // TODO: Send user the captcha question
    await sendCaptcha(user);
  });
};
