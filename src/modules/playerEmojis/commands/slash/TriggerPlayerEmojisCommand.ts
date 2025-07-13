import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import { checkForNewEmojis } from "../../utils/PlayerEmojis";

export default class TriggerPlayerEmojisCommand extends AdminSlashCommand {
  constructor() {
    super("triggerplayeremojis", "Manually trigger the player emoji process", true);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await checkForNewEmojis();

    this.replies.reply("Triggered player emoji process!");
  }
}
