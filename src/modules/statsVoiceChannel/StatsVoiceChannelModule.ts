import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";
import TotalMembersStatChannel from "./statChannels/TotalMembersStatChannel";
import TotalNitroBoostersStatChannel from "./statChannels/TotalNitroBoostersStatChannel";
import UpdateStatsChannelsTask from "./tasks/UpdateStatsChannelsTask";
import StatsVoiceChannelsManager from "./utils/StatsVoiceChannelsManager";

export default class StatsVoiceChannelModule extends Module {
  constructor() {
    super("StatsVoiceChannel");
  }

  protected override async setup(): Promise<void> {
    this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerStatChannels();
    this.registerSchedules();
  }

  private registerSchedules(): void {
    new UpdateStatsChannelsTask().createScheduledJob();
  }

  private registerStatChannels(): void {
    const manager = StatsVoiceChannelsManager.getInstance();

    manager.addStatChannel(new TotalMembersStatChannel());
    manager.addStatChannel(new TotalNitroBoostersStatChannel());
  }
}
