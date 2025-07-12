import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import { removeOldEmojis } from "../../utils/PlayerEmojis";
import discord from "@common/utils/discord/discord";

export default class RemovePlayerEmojisCommand extends AdminSlashCommand {
  constructor() {
    super("removeplayeremojis", "Remove all player emojis (May take a while)");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const replies = await discord.interactions.createReplies(interaction, "playerEmojis:RemovePlayerEmojisCommand:execute", true);

    await removeOldEmojis();

    await replies.reply("Removed all player emojis!");
  }
}
