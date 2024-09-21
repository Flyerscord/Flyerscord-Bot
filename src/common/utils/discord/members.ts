import { Collection, GuildMember } from "discord.js";
import { getGuild } from "./guilds";

export function getMember(userId: string): GuildMember | undefined {
    return getGuild()?.members.cache.get(userId);
}

export function getMembers(): Collection<string, GuildMember> | undefined {
    return getGuild()?.members.cache;
}