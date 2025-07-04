import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import { checkForGameDay, closeAndLockOldPosts } from "../../utils/GameChecker";

export default class TriggerPostCreationCommand extends AdminSlashCommand {
  constructor() {
    super("triggerpostcreation", "Trigger the post creation process");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    await closeAndLockOldPosts();
    await checkForGameDay();
    interaction.editReply({ content: "Triggered game day post creation process!" });
  }
}
