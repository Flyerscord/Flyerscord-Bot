import { bold } from "discord.js";
import Config from "../../../common/config/Config";
import ClientManager from "../../../common/managers/ClientManager";
import discord from "../../../common/utils/discord/discord";
import Stumper from "stumper";
import JoinImageGenerator from "../utils/JoinImageGenerator";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildMemberAdd", async (member) => {
    const username = member.displayName || member.user.username;

    const message = `<@${member.id}>\nWelcome to the ${bold("Go Flyers")}!! Rule #1: Fuck the Pens!`;
    const joinImageGenerator = new JoinImageGenerator(username, member.displayAvatarURL(), await discord.members.getMemberJoinPosition(member));
    let joinPhoto: Buffer;
    try {
      joinPhoto = await joinImageGenerator.getImage();
    } catch (error) {
      Stumper.caughtError(error, "joinLeave:onGuildMemberAdd");
      return;
    }

    await discord.messages.sendMessageAndImageBufferToChannel(Config.getConfig().joinLeaveMessageChannelId, message, joinPhoto);
    Stumper.info(`User ${username} has joined the server!`, "joinLeave:onGuildMemberAdd");
  });
};
