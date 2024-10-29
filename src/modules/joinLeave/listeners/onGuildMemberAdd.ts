import { bold } from "discord.js";
import Config from "../../../common/config/Config.js";
import ClientManager from "../../../common/managers/ClientManager.js";
import discord from "../../../common/utils/discord/discord.js";
import { createImage } from "../utils/imageGeneration.js";
import Stumper from "stumper";

export default (): void => {
  ClientManager.getInstance().client.on("guildMemberAdd", async (member) => {
    const username = member.displayName || member.user.username;

    const message = `<@${member.id}>\nWelcome to the ${bold("Go Flyers")}!! Rule #1: Fuck the Pens!`;
    const joinPhoto = await createImage(username, member.displayAvatarURL(), await discord.members.getMemberJoinPosition(member));

    await discord.messages.sendMessageAndImageBufferToChannel(Config.getConfig().joinLeaveMessageChannelId, message, joinPhoto);
    Stumper.info(`User ${username} has joined the server!`, "onGuildMemberAdd");
  });
};
