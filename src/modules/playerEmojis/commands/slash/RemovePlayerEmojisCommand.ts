import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import { removeOldEmojis } from "../../utils/PlayerEmojis";

export default class RemovePlayerEmojisCommand extends AdminSlashCommand {
  constructor() {
    super("removeplayeremojis", "Remove all player emojis (May take a while)", { ephermal: true });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await removeOldEmojis();

    this.replies.reply("Removed all player emojis!");
  }
}
