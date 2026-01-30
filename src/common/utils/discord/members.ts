import { BanOptions, Collection, GuildMember } from "discord.js";
import { getGuild } from "./guilds";
import Stumper from "stumper";
import MembersCache from "../../cache/MembersCache";

export async function getMember(userId: string, force: boolean = true): Promise<GuildMember | undefined> {
  try {
    if (force) {
      return await getGuild()?.members.fetch({ user: userId, force: true });
    }
    const membersCache = MembersCache.getInstance();
    return membersCache.getMember(userId);
  } catch (error) {
    Stumper.error(`Error finding member for user ${userId}`, "common:members:getMember");
    Stumper.caughtError(error, "common:members:getMember");
    return undefined;
  }
}

export async function getMembers(force: boolean = false): Promise<Collection<string, GuildMember> | undefined> {
  try {
    const membersCache = MembersCache.getInstance();
    if (force) {
      await membersCache.forceUpdate();
    }

    return membersCache.getCache();
  } catch (error) {
    Stumper.caughtError(error, "common:members:getMembers");
    return undefined;
  }
}

export async function getMemberJoinPosition(member: GuildMember): Promise<number> {
  const members = await getMembers(true);
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

export function getNumberOfMembers(): number {
  const guild = getGuild();
  return guild?.memberCount ?? 0;
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

export async function kick(userId: string, reason?: string): Promise<boolean> {
  const member = await getMember(userId);
  if (!member) {
    Stumper.warning(`Member with user id ${userId} not found, cannot kick`, "common:members:kick");
    return false;
  }
  Stumper.warning(`Kicking user ${userId}, reason: ${reason}`, "common:members:kick");
  await member.kick(reason);
  return true;
}

export async function banUser(userId: string, options: BanOptions = {}): Promise<boolean> {
  const member = await getMember(userId);
  if (!member) {
    Stumper.warning(`Member with user id ${userId} not found, cannot ban`, "common:members:banUser");
    return false;
  }
  Stumper.warning(`Banning user ${userId}, reason: ${options.reason}`, "common:members:banUser");
  await member.ban(options);
  return true;
}
