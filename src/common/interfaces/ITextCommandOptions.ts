import { PermissionResolvable } from "discord.js";

export default interface ITextCommandOptions {
  description?: string;
  allowedUsers?: string[];
  allowedRoles?: string[];
  allowedPermissions?: PermissionResolvable[];
  allowedLocations?: COMMAND_LOCATION[];
}

export enum COMMAND_LOCATION {
  GUILD = "guild",
  DM = "dm",
}
