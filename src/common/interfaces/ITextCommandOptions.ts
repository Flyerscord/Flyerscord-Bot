import { PermissionResolvable } from "discord.js";

export default interface ITextCommandOptions {
  description?: string;
  allowedUsers?: string[];
  allowedRoles?: string[];
  allowedPermissions?: Array<PermissionResolvable>;
  allowedLocations?: Array<COMMAND_LOCATION>;
}

export enum COMMAND_LOCATION {
  GUILD = "guild",
  DM = "dm",
}
