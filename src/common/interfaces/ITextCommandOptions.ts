import { PermissionResolvable } from "discord.js";

export default interface ITextCommandOptions {
  description?: string;
  allowedUsers?: Array<string>;
  allowedRoles?: Array<string>;
  allowedPermissions?: Array<PermissionResolvable>;
}
