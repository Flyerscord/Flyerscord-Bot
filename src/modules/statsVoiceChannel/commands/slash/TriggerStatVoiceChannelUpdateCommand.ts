import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import StatsVoiceChannelsManager from "../../utils/StatsVoiceChannelsManager";
import Stumper from "stumper";
import discord from "@common/utils/discord/discord";

export default class TriggerStatVoiceChannelUpdateCommand extends AdminSlashCommand {
  constructor() {
    super("triggerstatvoicechannelupdate", "Manually trigger the stat voice channel update process");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const replies = await discord.interactions.createReplies(interaction, "statsVoiceChannel:TriggerStatVoiceChannelUpdateCommand:execute", true);

    const statsVoiceChannelsManager = StatsVoiceChannelsManager.getInstance();
    const statChannels = statsVoiceChannelsManager.getStatChannels();

    for (const statChannel of statChannels) {
      await statChannel.update();
    }

    Stumper.info(`Updated ${statChannels.length} stats channels`, "statsVoiceChannel:TriggerStatVoiceChannelUpdateCommand:execute");
    await replies.reply("Triggered stat voice channel update process!");
  }
}
