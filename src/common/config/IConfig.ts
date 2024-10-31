import { LOG_LEVEL } from "stumper";

export type IConfig = IDevConfig;

interface IDevConfig extends ICommonConfig {
  guildId?: string;
}

interface ICommonConfig {
  token: string;
  logLevel: LOG_LEVEL;
  masterGuildId: string;
  prefix: IPrefixConfig;
  customCommandListChannelId: string;
  imageKit: IImageKitConfig;
  imgur: IImgurConfig;
  vistorReactRole: IVistorReactConfig;
  gameDayPosts: IGameDayPostsConfig;
  joinLeaveMessageChannelId: string;
  userLogChannelId: string;
  voiceStatsChannels: IVoiceStatsConfig[];
}

interface IPrefixConfig {
  normal: string;
  admin: string;
}

interface IVistorReactConfig {
  memberRoleId: string;
  visitorRoleId: string;
  visitorEmojiId: string;
  rolesChannelId: string;
}

interface IGameDayPostsConfig {
  channelId: string;
  tagIds: IGameDayPostsTagIdsConfig;
}

interface IGameDayPostsTagIdsConfig {
  preseason: string;
  regularSeason: string;
  postseason: string;
  seasons: IGameDayPostsTagIdsSeasonsConfig[];
}

interface IGameDayPostsTagIdsSeasonsConfig {
  name: string;
  startingYear: number;
  endingYear: number;
  tagId: string;
}

interface IImageKitConfig {
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
  redirectUrl: string;
}

interface IImgurConfig {
  clientId: string;
  clientSecret: string;
}

interface IVoiceStatsConfig {
  name: string;
  channelId: string;
}
