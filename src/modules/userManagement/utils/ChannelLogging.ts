import ConfigManager from "@common/config/ConfigManager";
import discord from "@common/utils/discord/discord";

export async function sendLogMessage(message: string): Promise<void> {
  await discord.messages.sendMessageToChannel(ConfigManager.getInstance().getConfig("UserManagement").channelId, message);
}
