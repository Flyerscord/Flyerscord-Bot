import ReactionMessageDB from "../providers/ReactionMessage.Database";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";
import { EmbedBuilder } from "discord.js";
import type { IReactionRolesConfig } from "../ReactionRoleModule";
import ConfigManager from "@common/config/ConfigManager";

export async function createRoleReactionMessagesIfNeeded(): Promise<void> {
  const db = ReactionMessageDB.getInstance();
  const config = ConfigManager.getInstance().getConfig("ReactionRole");

  const reactionRoles = config.reactionRoles;

  for (const reactionRole of reactionRoles) {
    if (
      !db.hasReactionMessage(reactionRole.name) ||
      (await discord.messages.getMessage(config.channelId, db.getReactionMessage(reactionRole.name)!)) == undefined
    ) {
      await createRoleReactionMessage(reactionRole);
    } else {
      Stumper.debug(`Reaction role message for ${reactionRole.name} already exists!`, "reactionRole:utils:createRoleReactionMessagesIfNeeded");
    }
  }
}

async function createRoleReactionMessage(reactionRole: IReactionRolesConfig): Promise<void> {
  const db = ReactionMessageDB.getInstance();
  const embed = createEmbed(reactionRole);
  const message = await discord.messages.sendEmbedToChannel(ConfigManager.getInstance().getConfig("ReactionRole").channelId, embed);

  if (message) {
    db.setReactionMessage(reactionRole.name, message.id);

    await discord.reactions.reactToMessageWithEmoji(message, reactionRole.emojiId);
    Stumper.info(`Created reaction role message with id: ${message.id}`, "reactionRole:utils:createRoleReactionMessage");
  } else {
    Stumper.error("Error creating reaction role message!", "reactionRole:utils:createRoleReactionMessage");
  }
}

function createEmbed(reactionRole: IReactionRolesConfig): EmbedBuilder {
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

  const reactionRoles = ConfigManager.getInstance().getConfig("ReactionRole").reactionRoles;
  for (const reactionRole of reactionRoles) {
    if (reactionRole.messageId) {
      Stumper.info(`Setting message id for ${reactionRole.name} to ${reactionRole.messageId}`, "reactionRole:utils:setMessageIdsFromConfig");
      db.setReactionMessage(reactionRole.name, reactionRole.messageId);
    }
  }
}
