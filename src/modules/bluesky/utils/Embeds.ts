import { EmbedBuilder } from "discord.js";
import { IPost } from "../interfaces/IPost";

// BlueSky brand color
const BLUESKY_COLOR = 0x1185fe;

export function createBlueSkyPostEmbed(post: IPost): EmbedBuilder {
  const embed = new EmbedBuilder();

  // Set author with avatar
  const authorName = post.author.displayName ? `${post.author.displayName} (@${post.author.handle})` : `@${post.author.handle}`;

  embed.setAuthor({
    name: authorName,
    iconURL: post.author.avatar || undefined,
    url: `https://bsky.app/profile/${post.author.handle}`,
  });

  // Set post content as description
  let description = post.text;
  if (description.length > 4000) {
    description = description.substring(0, 3997) + "...";
  }

  // Add "View on BlueSky" link at the end of description
  if (description.length > 0) {
    description += `\n\n[View on BlueSky](${post.url})`;
  } else {
    description = `[View on BlueSky](${post.url})`;
  }

  embed.setDescription(description);

  // Set timestamp from post creation time
  embed.setTimestamp(post.createdAt);

  // Use BlueSky brand color
  embed.setColor(BLUESKY_COLOR);

  // Add engagement stats with emojis
  const stats = `❤️ ${post.likeCount} · 🔁 ${post.repostCount} · 💬 ${post.replyCount} · 💭 ${post.quoteCount}`;
  embed.addFields({ name: "\u200B", value: stats, inline: false });

  // Handle images - Discord embeds can only show one image directly
  if (post.images.length > 0) {
    embed.setImage(post.images[0].fullsize);

    // If there are multiple images, add a note in footer
    if (post.images.length > 1) {
      embed.setFooter({
        text: `+${post.images.length - 1} more image${post.images.length > 2 ? "s" : ""} on BlueSky`,
      });
    }
  }

  return embed;
}
