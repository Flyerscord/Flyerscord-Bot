import { Colors, EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import discord from "@common/utils/discord/discord";
import { InteractionReplies } from "@common/utils/discord/InteractionReplies";
import TicketsDB from "../db/TicketsDB";

/**
 * Stores a submitted ticket, with the submitter's user ID encrypted before it touches the database,
 * posts an anonymous summary to the ticket type's configured review channel, and confirms receipt to
 * the submitter along with a disclosure of how their identity is handled.
 * @param type - The ticket type (e.g. "tip")
 * @param interaction - The modal submit interaction that produced the ticket
 * @param content - The ticket content submitted by the user
 * @param reviewChannelId - The channel where the anonymous ticket summary is posted
 * @param replies - The submitting command's reply helper, used to confirm receipt
 */
export async function submitTicket(
  type: string,
  interaction: ModalSubmitInteraction,
  content: string,
  reviewChannelId: string,
  replies: InteractionReplies,
): Promise<void> {
  const db = new TicketsDB();
  await db.createTicket(type, content, interaction.user.id);

  const embed = new EmbedBuilder()
    .setTitle(`New ${capitalize(type)}`)
    .setDescription(content)
    .setColor(Colors.Blurple)
    .setTimestamp(Date.now());

  await discord.messages.sendEmbedToChannel(reviewChannelId, embed);

  await replies.reply({
    content:
      "Thanks, your submission has been received anonymously. Your identity is encrypted for privacy and only stored to help combat abuse; decrypting it requires manual action by the bot owner.",
  });
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
