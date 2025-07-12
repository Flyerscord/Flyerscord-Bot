import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import { checkForGameDay, closeAndLockOldPosts } from "../../utils/GameChecker";
import discord from "@common/utils/discord/discord";

export default class TriggerPostCreationCommand extends AdminSlashCommand {
  constructor() {
    super("triggerpostcreation", "Trigger the post creation process");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const replies = await discord.interactions.createReplies(interaction, "gameDayPosts:TriggerPostCreationCommand:execute", true);

    await closeAndLockOldPosts();
    await checkForGameDay();
    await replies.reply("Triggered game day post creation process!");
  }
}
