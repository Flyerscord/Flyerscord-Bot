import { Channel, ChatInputCommandInteraction, TextChannel } from "discord.js";
import SlashCommand, { PARAM_TYPES } from "@common/models/SlashCommand";
import PinsDB from "../../providers/Pins.Database";
import Stumper from "stumper";
import { getPinEmbed } from "../../utils/Embeds";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/config/ConfigManager";

export default class ImportPinsCommand extends SlashCommand {
  constructor() {
    super("importpins", "Import pins from a channel");

    this.data.addChannelOption((option) => option.setName("channel").setDescription("The channel to import pins from").setRequired(true));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const replies = await discord.interactions.createReplies(interaction, "pins:ImportPinsCommand:execute", true);

    const channel: Channel = this.getParamValue(interaction, PARAM_TYPES.CHANNEL, "channel");
    const db = PinsDB.getInstance();
    const config = ConfigManager.getInstance().getConfig("Pins");

    let hasFailures = false;

    if (channel && channel instanceof TextChannel) {
      const textChannel = channel as TextChannel;

      if (config.channelId == textChannel.id) {
        await replies.reply({ content: "Cannot import pins from the pins channel!", ephemeral: true });
        return;
      }

      // Gets the pinned messages from the channel sorted oldest to newest
      const pinnedMessages = (await textChannel.messages.fetchPinned()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);

      if (pinnedMessages.size == 0) {
        await replies.reply({ content: "No pinned messages found!", ephemeral: true });
        return;
      }

      for (const message of pinnedMessages) {
        // Send message to pin channel
        const pin = db.addPin(message[1].id, message[1].channelId, message[1].createdAt, interaction.user.id);
        if (!pin) {
          Stumper.error(`Failed to add pin for message ${message[1].id}. Message is already pinned!`, "pins:ImportPinsCommand:execute");
          hasFailures = true;
          continue;
        }

        const embed = await getPinEmbed(pin);

        if (embed) {
          const pinMessage = await discord.messages.sendEmbedToChannel(config.channelId, embed);
          if (pinMessage) {
            db.updateMessageId(message[1].id, pinMessage.id);
          } else {
            Stumper.error(`Failed to send message to pins channel!`, "pins:ImportPinsCommand:execute");
            hasFailures = true;
          }
        } else {
          Stumper.error(`Failed to get embed for pin message!`, "pins:ImportPinsCommand:execute");
          hasFailures = true;
        }
      }
    }

    if (hasFailures) {
      await replies.reply("There were errors importing the pins! Some may have been skipped.");
      return;
    }
    await replies.reply("Pins imported successfully!");
  }
}
