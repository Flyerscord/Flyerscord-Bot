import { EmbedBuilder } from "discord.js";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";
import ConfigManager from "@root/src/common/managers/ConfigManager";
import VisitorRoleDB from "../db/VisitorRoleDB";

export async function createVisitorRoleMessageIfNeeded(): Promise<void> {
  const db = new VisitorRoleDB();
  const visitorMessageId = await db.getVisitorRoleMessageId();

  const config = ConfigManager.getInstance().getConfig("VisitorRole");

  if (visitorMessageId == "") {
    const visitorEmojiId = config.visitorEmojiId;
    const rolesChannelId = config.rolesChannelId;

    const embed = createEmbed();

    const message = await discord.messages.sendEmbedToChannel(rolesChannelId, embed);
    if (message) {
      await db.setVisitorRoleMessageId(message.id);
      await discord.reactions.reactToMessageWithEmoji(message, visitorEmojiId);
      Stumper.info(`Created visitor role message with id: ${message.id}`, "visitorRole:utils:createVisitorRoleMessageIfNeeded");
    } else {
      Stumper.error("Error creating visitor role message!", "visitorRole:utils:createVisitorRoleMessageIfNeeded");
    }
  }
}

function createEmbed(): EmbedBuilder {
  const embed = new EmbedBuilder();

  embed.setTitle("Visitor Role Selection");
  embed.setDescription(`Get the Visitor Role (Everyone else will get the member role)`);
  embed.setColor("NotQuiteBlack");

  return embed;
}
