import { IKeyedObject } from "../../common/interfaces/IKeyedObject";
import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";
import TotalMembersStatChannel from "./statChannels/TotalMembersStatChannel";
import TotalNitroBoostersStatChannel from "./statChannels/TotalNitroBoostersStatChannel";
import UpdateStatsChannelsTask from "./tasks/UpdateStatsChannelsTask";
import StatsVoiceChannelsManager from "./utils/StatsVoiceChannelsManager";

export default class StatsVoiceChannelModule extends Module<IStatsVoiceChannelConfig> {
  constructor(config: IKeyedObject) {
    super("StatsVoiceChannel", config);
  }

  protected async setup(): Promise<void> {
    this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerStatChannels();
    this.registerSchedules();
  }

  protected async cleanup(): Promise<void> {
    // Nothing to cleanup
  }

  protected getDefaultConfig(): IStatsVoiceChannelConfig {
    return {
      channels: [],
    };
  }

  private registerSchedules(): void {
    UpdateStatsChannelsTask.getInstance().createScheduledJob();
  }

  private registerStatChannels(): void {
    const manager = StatsVoiceChannelsManager.getInstance();

    manager.addStatChannel(new TotalMembersStatChannel());
    manager.addStatChannel(new TotalNitroBoostersStatChannel());
  }
}

export interface IStatsVoiceChannelConfig {
  channels: IStatsVoiceChannelChannelsConfig[];
}

interface IStatsVoiceChannelChannelsConfig {
  name: string;
  channelId: string;
}
