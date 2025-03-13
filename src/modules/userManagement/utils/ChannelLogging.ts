import discord from "../../../common/utils/discord/discord";
import UserManagementModule from "../UserManagementModule";

export function sendLogMessage(message: string): void {
  discord.messages.sendMessageToChannel(UserManagementModule.getInstance().config.channelId, message);
}
