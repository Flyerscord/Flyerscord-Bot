import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import { checkForNewEmojis } from "../../utils/PlayerEmojis";
import discord from "@common/utils/discord/discord";

export default class TriggerPlayerEmojisCommand extends AdminSlashCommand {
  constructor() {
    super("triggerplayeremojis", "Manually trigger the player emoji process");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const replies = await discord.interactions.createReplies(interaction, "playerEmojis:TriggerPlayerEmojisCommand:execute", true);

    await checkForNewEmojis();

    await replies.reply("Triggered player emoji process!");
  }
}
