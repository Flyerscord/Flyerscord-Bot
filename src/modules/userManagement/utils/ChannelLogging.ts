import CacheDB from "../../../common/providers/Cache.Database";
import discord from "../../../common/utils/discord/discord";

export function sendLogMessage(message: string): void {
    const db = CacheDB.getInstance();
    discord.messages.sendMessageToChannel(db.getUserLogChannelId(), message);
}