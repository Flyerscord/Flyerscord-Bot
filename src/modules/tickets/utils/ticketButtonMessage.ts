import { ActionRowBuilder, ButtonBuilder, Colors, EmbedBuilder } from "discord.js";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/managers/ConfigManager";
import Stumper from "stumper";
import TicketsDB from "../db/TicketsDB";
import TipButton from "../commands/buttons/TipButton";

/**
 * Ensures the persistent "Submit a Tip" button message exists in the configured channel, posting a
 * fresh one if none is recorded yet or the previously posted message no longer exists (e.g. was deleted).
 */
export async function createTipButtonMessageIfNeeded(): Promise<void> {
  const config = ConfigManager.getInstance().getConfig("Tickets");
  const channelId = config["tip.buttonChannelId"];

  const db = new TicketsDB();
  const existing = await db.getButtonMessage("tip");
  if (existing && (await discord.messages.getMessage(existing.channelId, existing.messageId))) {
    Stumper.debug("Tip button message already exists!", "tickets:ticketButtonMessage:createTipButtonMessageIfNeeded");
    return;
  }

  const channel = await discord.channels.getTextChannel(channelId);
  if (!channel) {
    Stumper.error(`Could not find tip button channel ${channelId}!`, "tickets:ticketButtonMessage:createTipButtonMessageIfNeeded");
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("Submit an Anonymous Tip")
    .setDescription("Click the button below to submit a tip anonymously.")
    .setColor(Colors.Blurple);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(new TipButton().button);

  const message = await channel.send({ embeds: [embed], components: [row] });
  await db.setButtonMessage("tip", channel.id, message.id);
  Stumper.info(`Created tip button message with id: ${message.id}`, "tickets:ticketButtonMessage:createTipButtonMessageIfNeeded");
}
