import { EmbedBuilder } from "discord.js";
import Config from "../../../common/config/Config.js";
import GlobalDB from "../../../common/providers/Global.Database.js";
import discord from "../../../common/utils/discord/discord.js";
import Stumper from "stumper";

export async function createVisitorRoleMessageIfNeeded(): Promise<void> {
  const db = GlobalDB.getInstance();
  const visitorMessageId = db.getVisitorRoleMessageId();

  if (visitorMessageId == "") {
    const visitorEmojiId = Config.getConfig().vistorReactRole.visitorEmojiId;
    const rolesChannelId = Config.getConfig().vistorReactRole.rolesChannelId;

    const embed = createEmbed();

    const message = await discord.messages.sendEmbedToChannel(rolesChannelId, embed);
    if (message) {
      db.setVisitorRoleMessageId(message.id);
      discord.reactions.reactToMessageWithEmoji(message, visitorEmojiId);
      Stumper.info(`Created visitor role message with id: ${message.id}`, "createVisitorRoleMessageIfNeeded");
    } else {
      Stumper.error("Error creating visitor role message!", "createVisitorRoleMessageIfNeeded");
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
