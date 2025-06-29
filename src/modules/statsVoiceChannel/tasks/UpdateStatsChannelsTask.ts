import Stumper from "stumper";
import Task from "@common/models/Task";
import StatsVoiceChannelsManager from "../utils/StatsVoiceChannelsManager";

export default class UpdateStatsChannelsTask extends Task {
  constructor() {
    super("UpdateStatsChannelsTask", "*/15 * * * *");
  }

  protected async execute(): Promise<void> {
    const statsVoiceChannelsManager = StatsVoiceChannelsManager.getInstance();
    const statChannels = statsVoiceChannelsManager.getStatChannels();

    for (const statChannel of statChannels) {
      await statChannel.update();
    }
    Stumper.info(`Updated ${statChannels.length} stats channels`, "statsVoiceChannel:UpdateStatsChannelsTask:execute");
  }
}
