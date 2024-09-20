import { Role, GuildMember } from "discord.js";

export async function addRoleToUser(member: GuildMember, roleId: string): Promise<void> {
    if (!userHasRole(member, roleId)) {
        await member.roles.add(roleId);
    }
}

export async function removeRoleToUser(member: GuildMember, roleId: string): Promise<void> {
    if (userHasRole(member, roleId)) {
        await member.roles.remove(roleId);
    }
}

export function userHasRole(member: GuildMember, roleId: string): boolean {
    return member.roles.cache.some((role: Role) => role.id == roleId);
}