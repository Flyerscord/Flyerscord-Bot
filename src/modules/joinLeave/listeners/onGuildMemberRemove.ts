import { AttachmentBuilder, bold } from "discord.js";
import ClientManager from "../../../common/managers/ClientManager";
import discord from "../../../common/utils/discord/discord";
import Stumper from "stumper";
import JoinLeaveModule from "../JoinLeaveModule";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildMemberRemove", async (member) => {
    const username = member.displayName || member.user.username;
    const message = `${bold(username)} has just left the server! Typical Pens fan ${bold(username)}...`;

    await discord.messages.sendMessageAndAttachmentToChannel(
      JoinLeaveModule.getInstance().config.channelId,
      message,
      new AttachmentBuilder("https://i.imgur.com/dDrkXV6.gif"),
    );
    Stumper.info(`User ${username} has left the server!`, "joinLeave:onGuildMemberRemove");
  });
};
