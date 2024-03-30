import { LOG_LEVEL } from "stumper";

export type IConfig = IDevConfig;

interface IDevConfig extends ICommonConfig {
  guildId?: string;
}

interface ICommonConfig {
  token: string;
  prefixes: IPrefixes;
  vistorReactRole: IVistorReactConfig;
  liveData: ILiveDataConfig;
  auditLogChannelId: string;
  imgurClientId: string;
  logLevel: LOG_LEVEL;
}

interface IVistorReactConfig {
  memberRoleId: string;
  visitorRoleId: string;
  visitorEmoji: string;
  visitorEmojiId: string;
  rolesChannelId: string;
}

interface ILiveDataConfig {
  notificationChannelId: string;
  periodNotificationRoleId: string;
}

interface IPrefixes {
  normal: string;
  custom: string;
}
