export type IConfig = IDevConfig;

interface IDevConfig extends ICommonConfig {
  guildId?: string;
}

interface ICommonConfig {
  token: string;
  prefix: string;
  vistorReactRole: IVistorReactConfig;
  liveData: ILiveDataConfig;
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
