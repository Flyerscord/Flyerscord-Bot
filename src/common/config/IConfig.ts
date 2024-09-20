import { LOG_LEVEL } from "stumper";

export type IConfig = IDevConfig;

interface IDevConfig extends ICommonConfig {
    guildId?: string;
}

interface ICommonConfig {
    token: string;
    logLevel: LOG_LEVEL;
    prefixes: IPrefixes;
}

interface IPrefixes {
    normal: string;
    custom: string;
}