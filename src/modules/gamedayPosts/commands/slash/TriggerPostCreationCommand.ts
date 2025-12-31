import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import { checkForGameDay } from "../../utils/GameChecker";

export default class TriggerPostCreationCommand extends AdminSlashCommand {
  constructor() {
    super("triggerpostcreation", "Trigger the post creation process", { ephermal: true });
  }

  async execute(_interaction: ChatInputCommandInteraction): Promise<void> {
    await checkForGameDay();
    await this.replies.reply("Triggered game day post creation process!");
  }
}
