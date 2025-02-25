import StatsVoiceChannel from "../models/StatsVoiceChannel";

export default class StatsVoiceChannelsManager {
  private static instance: StatsVoiceChannelsManager;

  private statChannels: StatsVoiceChannel[];

  private constructor() {
    this.statChannels = [];
  }

  static getInstance(): StatsVoiceChannelsManager {
    return this.instance || (this.instance = new this());
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
