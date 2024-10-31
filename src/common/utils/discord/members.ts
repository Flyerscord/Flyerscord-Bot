import { Collection, Guild, GuildMember } from "discord.js";
import { getGuild } from "./guilds";
import Stumper from "stumper";

export async function getMember(userId: string): Promise<GuildMember | undefined> {
  return await getGuild()?.members.fetch(userId);
}

export async function getMembers(): Promise<Collection<string, GuildMember> | undefined> {
  return await getGuild()?.members.fetch();
}

export async function getMemberJoinPosition(member: GuildMember): Promise<number> {
  const members = await getMembers();
  if (members) {
    const sortedMembers = members
      .filter((m) => m.joinedTimestamp) // Only keep members with a valid join date
      .sort((a, b) => a.joinedTimestamp! - b.joinedTimestamp!);

    // Map sorted members to an array of their IDs
    const memberIds = sortedMembers.map((m) => m.id);

    return memberIds.indexOf(member.id) + 1;
  }
  return -1;
}

export async function getNitroBoosters(): Promise<GuildMember[]> {
  const members = await getMembers();
  if (!members) {
    Stumper.error("Error finding members", "common:members:getNitroBoosters");
    return [];
  }
  return members.filter((member) => member.premiumSince != null).map((member) => member);
}
