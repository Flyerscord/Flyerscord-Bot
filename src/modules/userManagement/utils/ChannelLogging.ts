import GlobalDB from "../../../common/providers/Global.Database";
import discord from "../../../common/utils/discord/discord.ts";

export function sendLogMessage(message: string): void {
  const db = GlobalDB.getInstance();
  discord.messages.sendMessageToChannel(db.getUserLogChannelId(), message);
}
