import { Singleton } from "@common/models/Singleton";
import StatsVoiceChannel from "../models/StatsVoiceChannel";

export default class StatsVoiceChannelsManager extends Singleton {
  private statChannels: StatsVoiceChannel[];

  constructor() {
    super();
    this.statChannels = [];
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
