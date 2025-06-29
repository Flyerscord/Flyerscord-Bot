import type { ICommonConfig } from "@common/CommonModule";
import type { IAdminConfig } from "./admin/AdminModule";
import type { IBlueSkyConfig } from "./bluesky/BlueSkyModule";
import type { ICustomCommandsConfig } from "./customCommands/CustomCommandsModule";
import type { IDaysUntilConfig } from "./daysUntil/DaysUntilModule";
import type { IGameDayPostsConfig } from "./gamedayPosts/GameDayPostsModule";
import type { IHealthCheckConfig } from "./healthcheck/HealthCheckModule";
import type { IImageProxyConfig } from "./imageProxy/ImageProxyModule";
import type { IJoinLeaveConfig } from "./joinLeave/JoinLeaveModule";
import type { ILevelsConfig } from "./levels/LevelsModule";
import type { IMiscConfig } from "./misc/MiscModule";
import type { INHLConfig } from "./nhl/NHLModule";
import type { IPinsConfig } from "./pins/PinsModule";
import type { IPlayerEmojisConfig } from "./playerEmojis/PlayerEmojisModule";
import type { IReactionRoleConfig } from "./reactionRole/ReactionRoleModule";
import type { IRegisterCommandsConfig } from "./registerCommands/RegisterCommandsModule";
import type { IStatsVoiceChannelConfig } from "./statsVoiceChannel/StatsVoiceChannelModule";
import type { IUserManagementConfig } from "./userManagement/UserManagementModule";
import type { IVisitorRoleConfig } from "./visitorRole/VisitorRoleModule";

export type Modules =
  | "Common"
  | "Admin"
  | "BlueSky"
  | "CustomCommands"
  | "DaysUntil"
  | "GameDayPosts"
  | "HealthCheck"
  | "ImageProxy"
  | "JoinLeave"
  | "Levels"
  | "Misc"
  | "NHL"
  | "Pins"
  | "PlayerEmojis"
  | "ReactionRole"
  | "RegisterCommands"
  | "StatsVoiceChannel"
  | "UserManagement"
  | "VisitorRole";

export type ModuleConfigMap = {
  Common: ICommonConfig;
  Admin: IAdminConfig;
  BlueSky: IBlueSkyConfig;
  CustomCommands: ICustomCommandsConfig;
  DaysUntil: IDaysUntilConfig;
  GameDayPosts: IGameDayPostsConfig;
  HealthCheck: IHealthCheckConfig;
  ImageProxy: IImageProxyConfig;
  JoinLeave: IJoinLeaveConfig;
  Levels: ILevelsConfig;
  Misc: IMiscConfig;
  NHL: INHLConfig;
  Pins: IPinsConfig;
  PlayerEmojis: IPlayerEmojisConfig;
  ReactionRole: IReactionRoleConfig;
  RegisterCommands: IRegisterCommandsConfig;
  StatsVoiceChannel: IStatsVoiceChannelConfig;
  UserManagement: IUserManagementConfig;
  VisitorRole: IVisitorRoleConfig;
};
