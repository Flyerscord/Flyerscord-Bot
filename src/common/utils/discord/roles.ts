import { Role, GuildMember, PartialGuildMember } from "discord.js";
import Stumper from "stumper";

export async function addRoleToUser(member: GuildMember, roleId: string): Promise<void> {
  if (!userHasRole(member, roleId)) {
    await member.roles.add(roleId);
  }
}

export async function removeRoleFromUser(member: GuildMember, roleId: string): Promise<void> {
  if (userHasRole(member, roleId)) {
    await member.roles.remove(roleId);
    Stumper.info(`Removed role ${roleId} from user ${member.id}`, "common:roles:removeRoleFromUser");
  } else {
    Stumper.warning(`User ${member.id} does not have role ${roleId}, skipping removal`, "common:roles:removeRoleFromUser");
  }
}

export function userHasRole(member: GuildMember, roleId: string): boolean {
  return member.roles.cache.some((role: Role) => role.id == roleId);
}

export function userHasAnyRole(member: GuildMember): boolean {
  return member.roles.cache.size > 0;
}

export function getUserRoles(member: GuildMember | PartialGuildMember): string[] {
  return member.roles.cache.map((role: Role) => role.id);
}
