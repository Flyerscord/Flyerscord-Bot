import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import StatsVoiceChannelsManager from "../../utils/StatsVoiceChannelsManager";
import Stumper from "stumper";

export default class TriggerStatVoiceChannelUpdateCommand extends AdminSlashCommand {
  constructor() {
    super("triggerstatvoicechannelupdate", "Manually trigger the stat voice channel update process", true);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const statsVoiceChannelsManager = StatsVoiceChannelsManager.getInstance();
    const statChannels = statsVoiceChannelsManager.getStatChannels();

    for (const statChannel of statChannels) {
      await statChannel.update();
    }

    Stumper.info(`Updated ${statChannels.length} stats channels`, "statsVoiceChannel:TriggerStatVoiceChannelUpdateCommand:execute");
    this.replies.reply("Triggered stat voice channel update process!");
  }
}
