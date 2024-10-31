import StatsVoiceChannel from "../models/StatsVoiceChannel";

export default class StatsVoiceChannelsManager {
  private static instance: StatsVoiceChannelsManager;

  private statChannels: StatsVoiceChannel[];

  private constructor() {
    this.statChannels = [];
  }

  static getInstance(): StatsVoiceChannelsManager {
    if (!StatsVoiceChannelsManager.instance) {
      StatsVoiceChannelsManager.instance = new StatsVoiceChannelsManager();
    }
    return StatsVoiceChannelsManager.instance;
  }

  addStatChannel(statChannel: StatsVoiceChannel): void {
    this.statChannels.push(statChannel);
  }

  getStatChannels(): StatsVoiceChannel[] {
    return this.statChannels;
  }

  clearStatChannels(): void {
    this.statChannels = [];
  }
}
