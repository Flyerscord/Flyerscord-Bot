import Config from "../../../common/config/Config";
import ReactionMessageDB from "../providers/ReactionMessage.Database";
import { IReactionRoleConfig } from "../../../common/config/IConfig";
import discord from "../../../common/utils/discord/discord";
import Stumper from "stumper";
import { EmbedBuilder } from "discord.js";

export async function createRoleReactionMessagesIfNeeded(): Promise<void> {
  const db = ReactionMessageDB.getInstance();

  const reactionRoles = Config.getConfig().reactionRoles.reactionRoles;

  for (const reactionRole of reactionRoles) {
    if (!db.hasReactionMessage(reactionRole.name)) {
      await createRoleReactionMessage(reactionRole);
    }
  }
}

async function createRoleReactionMessage(reactionRole: IReactionRoleConfig): Promise<void> {
  const db = ReactionMessageDB.getInstance();
  const embed = createEmbed(reactionRole);
  const message = await discord.messages.sendEmbedToChannel(Config.getConfig().reactionRoles.channelId, embed);

  if (message) {
    db.setReactionMessage(reactionRole.name, message.id);

    discord.reactions.reactToMessageWithEmoji(message, reactionRole.emojiId);
    Stumper.info(`Created reaction role message with id: ${message.id}`, "reactionRole:utils:createRoleReactionMessage");
  } else {
    Stumper.error("Error creating reaction role message!", "reactionRole:utils:createRoleReactionMessage");
  }
}

function createEmbed(reactionRole: IReactionRoleConfig): EmbedBuilder {
  const embed = new EmbedBuilder();

  embed.setTitle(`${reactionRole.name} Role`);
  embed.setDescription(reactionRole.description);

  // Convert hex color string to a number
  const colorNumber = parseInt(reactionRole.colorHex.replace(/^#/, ""), 16);
  embed.setColor(colorNumber);

  return embed;
}

export function setMessageIdsFromConfig(): void {
  const db = ReactionMessageDB.getInstance();

  const reactionRoles = Config.getConfig().reactionRoles.reactionRoles;
  for (const reactionRole of reactionRoles) {
    if (reactionRole.messageId) {
      db.setReactionMessage(reactionRole.name, reactionRole.messageId);
    }
  }
}
