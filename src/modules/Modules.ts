import type { ConfigFromSchemas } from "@common/managers/ConfigManager";
import type { commonConfigSchema } from "@common/CommonModule";
import type { adminConfigSchema } from "./admin/AdminModule";
import type { blueSkyConfigSchema } from "./bluesky/BlueSkyModule";
import type { customCommandsConfigSchema } from "./customCommands/CustomCommandsModule";
import type { daysUntilConfigSchema } from "./daysUntil/DaysUntilModule";
import type { gameDayPostsConfigSchema } from "./gamedayPosts/GameDayPostsModule";
import type { healthCheckConfigSchema } from "./healthcheck/HealthCheckModule";
import type { imageProxyConfigSchema } from "./imageProxy/ImageProxyModule";
import type { joinLeaveConfigSchema } from "./joinLeave/JoinLeaveModule";
import type { levelsConfigSchema } from "./levels/LevelsModule";
import type { miscConfigSchema } from "./misc/MiscModule";
import type { nHLConfigSchema } from "./nhl/NHLModule";
import type { pinsConfigSchema } from "./pins/PinsModule";
import type { playerEmojisConfigSchema } from "./playerEmojis/PlayerEmojisModule";
import type { reactionRoleConfigSchema } from "./reactionRole/ReactionRoleModule";
import type { registerCommandsConfigSchema } from "./registerCommands/RegisterCommandsModule";
import type { rulesConfigSchema } from "./rules/RulesModule";
import type { statsVoiceChannelConfigSchema } from "./statsVoiceChannel/StatsVoiceChannelModule";
import type { visitorRoleConfigSchema } from "./visitorRole/VisitorRoleModule";

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
  | "Rules"
  | "StatsVoiceChannel"
  | "VisitorRole";

/**
 * Type map of module names to their configuration object types.
 *
 * This type is automatically inferred from each module's config schema using the
 * ConfigFromSchemas utility type, which extracts TypeScript types from Zod schemas.
 *
 * Each entry uses `typeof` to reference the exported const schema array from each module,
 * then ConfigFromSchemas converts that array into a typed object with dotted keys.
 *
 * Example: For a module with config keys "ub3rBot.userId" and "ub3rBot.alertChannelId",
 * the result will be: { "ub3rBot.userId": string; "ub3rBot.alertChannelId": string }
 *
 * Access configs using bracket notation: config["ub3rBot.userId"]
 */
export type ModuleConfigMap = {
  Common: ConfigFromSchemas<typeof commonConfigSchema>;
  Admin: ConfigFromSchemas<typeof adminConfigSchema>;
  BlueSky: ConfigFromSchemas<typeof blueSkyConfigSchema>;
  CustomCommands: ConfigFromSchemas<typeof customCommandsConfigSchema>;
  DaysUntil: ConfigFromSchemas<typeof daysUntilConfigSchema>;
  GameDayPosts: ConfigFromSchemas<typeof gameDayPostsConfigSchema>;
  HealthCheck: ConfigFromSchemas<typeof healthCheckConfigSchema>;
  ImageProxy: ConfigFromSchemas<typeof imageProxyConfigSchema>;
  JoinLeave: ConfigFromSchemas<typeof joinLeaveConfigSchema>;
  Levels: ConfigFromSchemas<typeof levelsConfigSchema>;
  Misc: ConfigFromSchemas<typeof miscConfigSchema>;
  NHL: ConfigFromSchemas<typeof nHLConfigSchema>;
  Pins: ConfigFromSchemas<typeof pinsConfigSchema>;
  PlayerEmojis: ConfigFromSchemas<typeof playerEmojisConfigSchema>;
  ReactionRole: ConfigFromSchemas<typeof reactionRoleConfigSchema>;
  RegisterCommands: ConfigFromSchemas<typeof registerCommandsConfigSchema>;
  Rules: ConfigFromSchemas<typeof rulesConfigSchema>;
  StatsVoiceChannel: ConfigFromSchemas<typeof statsVoiceChannelConfigSchema>;
  VisitorRole: ConfigFromSchemas<typeof visitorRoleConfigSchema>;
};
