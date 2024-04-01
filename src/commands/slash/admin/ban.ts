import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { AdminSlashCommand, PARAM_TYPES } from "../../../models/SlashCommand";
import Stumper from "stumper";

export default class BanSlashCommand extends AdminSlashCommand {
  constructor() {
    super("ban", "Ban a user");

    this.data
      .addMentionableOption((option) => option.setName("user").setDescription("The user to ban").setRequired(true))
      .addStringOption((option) => option.setName("reason").setDescription("The reason for banning.").setRequired(true))
      .addIntegerOption((option) =>
        option
          .setName("deleteMessagesTime")
          .setDescription("The number of seconds to go back and delete of the banned users messages")
          .setMinValue(0),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const member: GuildMember = this.getParamValue(interaction, PARAM_TYPES.MEMBER, "user");
    const reason: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "reason");
    const deleteMessagesSeconds: number = this.getParamValue(interaction, PARAM_TYPES.INTEGER, "deleteMessagesTime") || 0;

    await member.ban({ deleteMessageSeconds: deleteMessagesSeconds, reason: reason });

    Stumper.warning(
      `User ${member.displayName || member.user.username} (id: ${member.user.id}) has been banned by ${interaction.user.username}!`,
      "BanSlashCommand",
    );
    if (deleteMessagesSeconds > 0) {
      Stumper.warning(
        `Deleting messages from ${member.displayName || member.user.username} for the last ${deleteMessagesSeconds} seconds.`,
        "BanSlashCommand",
      );
    }
    interaction.reply(`User ${member.displayName || member.user.username} has been banned!`);
  }
}
