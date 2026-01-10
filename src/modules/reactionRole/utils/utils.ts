import discord from "@common/utils/discord/discord";
import Stumper from "stumper";
import { EmbedBuilder } from "discord.js";
import ConfigManager from "@root/src/common/managers/ConfigManager";
import ReactionRoleDB from "../db/ReactionRoleDB";
import type { ReactionRolesConfig } from "../ReactionRoleModule";

export async function createRoleReactionMessagesIfNeeded(): Promise<void> {
  const db = new ReactionRoleDB();
  const config = ConfigManager.getInstance().getConfig("ReactionRole");

  const reactionRoles = config.reactionRoles;

  for (const reactionRole of reactionRoles) {
    if (
      !db.hasReactionMessage(reactionRole.name) ||
      (await discord.messages.getMessage(config.channelId, (await db.getReactionMessage(reactionRole.name))!)) == undefined
    ) {
      await createRoleReactionMessage(reactionRole);
    } else {
      Stumper.debug(`Reaction role message for ${reactionRole.name} already exists!`, "reactionRole:utils:createRoleReactionMessagesIfNeeded");
    }
  }
}

async function createRoleReactionMessage(reactionRole: ReactionRolesConfig): Promise<void> {
  const db = new ReactionRoleDB();
  const embed = createEmbed(reactionRole);
  const message = await discord.messages.sendEmbedToChannel(ConfigManager.getInstance().getConfig("ReactionRole").channelId, embed);

  if (message) {
    await db.setReactionMessage(reactionRole.name, message.id);

    await discord.reactions.reactToMessageWithEmoji(message, reactionRole.emojiId);
    Stumper.info(`Created reaction role message with id: ${message.id}`, "reactionRole:utils:createRoleReactionMessage");
  } else {
    Stumper.error("Error creating reaction role message!", "reactionRole:utils:createRoleReactionMessage");
  }
}

function createEmbed(reactionRole: ReactionRolesConfig): EmbedBuilder {
  const embed = new EmbedBuilder();

  embed.setTitle(`${reactionRole.name} Role`);
  embed.setDescription(reactionRole.description);

  // Convert hex color string to a number
  const colorNumber = parseInt(reactionRole.colorHex.replace(/^#/, ""), 16);
  embed.setColor(colorNumber);

  return embed;
}

export async function setMessageIdsFromConfig(): Promise<void> {
  const db = new ReactionRoleDB();

  const reactionRoles = ConfigManager.getInstance().getConfig("ReactionRole").reactionRoles;
  for (const reactionRole of reactionRoles) {
    if (reactionRole.messageId) {
      Stumper.info(`Setting message id for ${reactionRole.name} to ${reactionRole.messageId}`, "reactionRole:utils:setMessageIdsFromConfig");
      await db.setReactionMessage(reactionRole.name, reactionRole.messageId);
    }
  }
}
