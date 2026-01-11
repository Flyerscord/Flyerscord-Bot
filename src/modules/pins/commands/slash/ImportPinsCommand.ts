import { Channel, ChatInputCommandInteraction, TextChannel } from "discord.js";
import SlashCommand, { PARAM_TYPES } from "@common/models/SlashCommand";
import Stumper from "stumper";
import { getPinEmbed } from "../../utils/Embeds";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/managers/ConfigManager";
import PinsDB from "../../db/PinsDB";

export default class ImportPinsCommand extends SlashCommand {
  constructor() {
    super("importpins", "Import pins from a channel", { ephermal: true });

    this.data.addChannelOption((option) => option.setName("channel").setDescription("The channel to import pins from").setRequired(true));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel: Channel = this.getParamValue(interaction, PARAM_TYPES.CHANNEL, "channel");
    const db = new PinsDB();
    const config = ConfigManager.getInstance().getConfig("Pins");

    let hasFailures = false;

    if (channel && channel instanceof TextChannel) {
      const textChannel = channel as TextChannel;

      if (config.channelId == textChannel.id) {
        await this.replies.reply({ content: "Cannot import pins from the pins channel!", ephemeral: true });
        return;
      }

      // Gets the pinned messages from the channel sorted oldest to newest
      const pinnedMessagesResponse = await textChannel.messages.fetchPins();
      const pinnedMessages = pinnedMessagesResponse.items.map((pin) => pin.message).sort((a, b) => a.createdTimestamp - b.createdTimestamp);

      if (pinnedMessages.length == 0) {
        await this.replies.reply({ content: "No pinned messages found!", ephemeral: true });
        return;
      }

      for (const message of pinnedMessages) {
        // Send message to pin channel
        const pin = await db.addPin(message.id, message.channelId, message.createdAt, interaction.user.id);
        if (!pin) {
          Stumper.error(`Failed to add pin for message ${message.id}. Message is already pinned!`, "pins:ImportPinsCommand:execute");
          hasFailures = true;
          continue;
        }

        const embed = await getPinEmbed(pin);

        if (embed) {
          const pinMessage = await discord.messages.sendEmbedToChannel(config.channelId, embed);
          if (pinMessage) {
            await db.updateMessageId(message.id, pinMessage.id);
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
      await this.replies.reply("There were errors importing the pins! Some may have been skipped.");
      return;
    }
    await this.replies.reply("Pins imported successfully!");
  }
}
