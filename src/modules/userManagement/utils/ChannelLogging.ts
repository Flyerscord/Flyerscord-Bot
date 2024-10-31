import Config from "../../../common/config/Config";
import discord from "../../../common/utils/discord/discord";

export function sendLogMessage(message: string): void {
  discord.messages.sendMessageToChannel(Config.getConfig().userLogChannelId, message);
}
