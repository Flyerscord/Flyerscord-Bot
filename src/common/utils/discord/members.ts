import { Collection, GuildMember } from "discord.js";
import { getGuild } from "./guilds";
import Stumper from "stumper";

export async function getMember(userId: string): Promise<GuildMember | undefined> {
  try {
    return await getGuild()?.members.fetch(userId);
  } catch (_error) {
    Stumper.error(`Error finding member for user ${userId}`, "common:members:getMember");
    return undefined;
  }
}

export async function getMembers(): Promise<Collection<string, GuildMember> | undefined> {
  try {
    return await getGuild()?.members.fetch();
  } catch (error) {
    Stumper.error(error, "common:members:getMembers");
    return undefined;
  }
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

export async function timeout(member: GuildMember, seconds: number, reason: string): Promise<void> {
  await member.timeout(seconds * 1000, reason);
}

export async function removeTimeout(member: GuildMember, reason?: string): Promise<void> {
  await member.timeout(null, reason);
}
