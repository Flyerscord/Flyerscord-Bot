import { GuildMember } from "discord.js";
import { getGuild } from "./guilds";

export function getMember(userId: string): GuildMember | undefined {
    return getGuild()?.members.cache.get(userId);
}