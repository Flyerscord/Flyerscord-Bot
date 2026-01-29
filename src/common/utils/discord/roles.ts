import { Role, GuildMember, PartialGuildMember } from "discord.js";
import Stumper from "stumper";

/**
 * Adds a role to a guild member if the member does not already have it.
 *
 * Errors encountered while adding the role are reported via Stumper and do not propagate.
 *
 * @param member - The guild member to modify
 * @param roleId - The ID of the role to add
 * @returns true if the role was added successfully or the member already had the role, false if an error occurred
 */
export async function addRoleToUser(member: GuildMember, roleId: string): Promise<boolean> {
  try {
    if (!userHasRole(member, roleId)) {
      await member.roles.add(roleId);
      Stumper.info(`Added role ${roleId} to user ${member.id}`, "common:roles:addRoleToUser");
    }
    return true;
  } catch (error) {
    Stumper.caughtError(error, "common:roles:addRoleToUser");
    return false;
  }
}

/**
 * Remove a role from a guild member if the member currently has that role.
 *
 * If the role is present, attempts removal; on success logs an informational message.
 * If removal fails, the error is reported to Stumper and not rethrown.
 * If the member does not have the role, a warning is logged and no action is taken.
 *
 * @param member - The guild member to modify
 * @param roleId - The ID of the role to remove
 */
export async function removeRoleFromUser(member: GuildMember, roleId: string): Promise<void> {
  if (userHasRole(member, roleId)) {
    try {
      await member.roles.remove(roleId);
      Stumper.info(`Removed role ${roleId} from user ${member.id}`, "common:roles:removeRoleFromUser");
    } catch (error) {
      Stumper.caughtError(error, "common:roles:removeRoleFromUser");
    }
  } else {
    Stumper.warning(`User ${member.id} does not have role ${roleId}, skipping removal`, "common:roles:removeRoleFromUser");
  }
}

export function userHasRole(member: GuildMember | PartialGuildMember, roleId: string): boolean {
  return member.roles.cache.some((role: Role) => role.id == roleId);
}

export function userHasAnyRole(member: GuildMember): boolean {
  return member.roles.cache.size > 0;
}

export function getUserRoles(member: GuildMember | PartialGuildMember): string[] {
  return member.roles.cache.map((role: Role) => role.id);
}
