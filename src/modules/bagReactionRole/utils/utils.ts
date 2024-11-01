import { EmbedBuilder } from "discord.js";
import Config from "../../../common/config/Config";
import GlobalDB from "../../../common/providers/Global.Database";
import discord from "../../../common/utils/discord/discord";
import Stumper from "stumper";

export async function createBagRoleMessageIfNeeded(): Promise<void> {
  const db = GlobalDB.getInstance();
  const bagMessageId = db.getBagRoleMessageId();

  if (bagMessageId == "") {
    const bagEmojiId = Config.getConfig().bagReactionRole.emojiId;
    const bagChannelId = Config.getConfig().bagReactionRole.channelId;

    const embed = createEmbed();

    const message = await discord.messages.sendEmbedToChannel(bagChannelId, embed);
    if (message) {
      db.setBagRoleMessageId(message.id);
      discord.reactions.reactToMessageWithEmoji(message, bagEmojiId);
      Stumper.info(`Created bag role message with id: ${message.id}`, "bagReactionRole:utils:createBagRoleMessageIfNeeded");
    } else {
      Stumper.error("Error creating bag role message!", "bagReactionRole:utils:createBagRoleMessageIfNeeded");
    }
  }
}

function createEmbed(): EmbedBuilder {
  const embed = new EmbedBuilder();

  embed.setTitle("Bag Head Role");
  embed.setDescription("Get the BagHead Role");
  embed.setColor("#D2B48C");

  return embed;
}
