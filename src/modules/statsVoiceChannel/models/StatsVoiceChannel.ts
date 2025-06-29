import Stumper from "stumper";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/config/ConfigManager";

export default abstract class StatsVoiceChannel {
  name: string;
  channelId: string;
  prefix: string;

  constructor(name: string, prefix: string) {
    this.name = name;
    this.prefix = prefix;

    const statChannelConfig = ConfigManager.getInstance()
      .getConfig("StatsVoiceChannel")
      .channels.find((statChannel) => statChannel.name == name);
    if (statChannelConfig) {
      this.channelId = statChannelConfig.channelId;
    } else {
      Stumper.error(`${this.name}:  Error finding config for stat channel`, "statsVoiceChannel:StatsVoiceChannel:constructor");
      this.channelId = "";
    }
  }

  async update(): Promise<void> {
    const newValue = await this.getNewValue();
    if (newValue != null) {
      await this.updateVoiceChannel(newValue);
    }
  }

  protected async getNewValue(): Promise<string | null> {
    throw new Error("Not Implemented");
  }

  protected async updateVoiceChannel(newValue: string): Promise<void> {
    if (this.channelId == "") {
      return;
    }

    const voiceChannel = await discord.channels.getVoiceChannel(this.channelId);

    if (!voiceChannel) {
      Stumper.error(`${this.name}:  Error finding voice channel ${this.channelId}`, "statsVoiceChannel:StatsVoiceChannel:updateVoiceChannel");
      return;
    }

    await voiceChannel.setName(`${this.prefix}: ${newValue}`);
    Stumper.info(
      `${this.name}:  Updated voice channel ${this.channelId} with value ${newValue}`,
      "statsVoiceChannel:StatsVoiceChannel:updateVoiceChannel",
    );
  }
}
