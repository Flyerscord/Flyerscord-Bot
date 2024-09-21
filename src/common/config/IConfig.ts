import { LOG_LEVEL } from "stumper";

export type IConfig = IDevConfig;

interface IDevConfig extends ICommonConfig {
  guildId?: string;
}

interface ICommonConfig {
  token: string;
  logLevel: LOG_LEVEL;
  masterGuildId: string;
  prefix: string;
  customCommandListChannelId: string;
  imgurClientId: string;
}
