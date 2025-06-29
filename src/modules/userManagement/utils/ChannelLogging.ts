import ConfigManager from "@common/config/ConfigManager";
import discord from "../../../common/utils/discord/discord";

export function sendLogMessage(message: string): void {
  discord.messages.sendMessageToChannel(ConfigManager.getInstance().getConfig("UserManagement").channelId, message);
}
