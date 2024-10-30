import { bold } from "discord.js";
import Config from "../../../common/config/Config";
import ClientManager from "../../../common/managers/ClientManager";
import discord from "../../../common/utils/discord/discord";
import { createImage } from "../utils/imageGeneration";
import Stumper from "stumper";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildMemberAdd", async (member) => {
    const username = member.displayName || member.user.username;

    const message = `<@${member.id}>\nWelcome to the ${bold("Go Flyers")}!! Rule #1: Fuck the Pens!`;
    const joinPhoto = await createImage(username, member.displayAvatarURL(), await discord.members.getMemberJoinPosition(member));

    await discord.messages.sendMessageAndImageBufferToChannel(Config.getConfig().joinLeaveMessageChannelId, message, joinPhoto);
    Stumper.info(`User ${username} has joined the server!`, "onGuildMemberAdd");
  });
};
