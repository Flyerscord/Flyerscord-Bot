import { PermissionResolvable } from "discord.js";

export default interface ITextCommandOptions {
  allowedUsers?: Array<string>;
  allowedRoles?: Array<string>;
  allowedPermissions?: Array<PermissionResolvable>;
}
