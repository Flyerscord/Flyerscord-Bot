import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "../../../../common/models/SlashCommand";
import { checkForGameDay, closeAndLockOldPosts } from "../../utils/GameChecker";

export default class TriggerPostCreationCommand extends AdminSlashCommand {
  constructor() {
    super("triggerpostcreation", "Trigger the post creation process");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await closeAndLockOldPosts();
    await checkForGameDay();
    interaction.reply({ content: "Triggered game day post creation process!", ephemeral: true });
  }
}
