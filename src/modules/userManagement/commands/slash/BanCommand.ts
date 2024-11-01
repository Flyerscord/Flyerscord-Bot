import { ChatInputCommandInteraction, User } from "discord.js";
import Stumper from "stumper";
import { AdminSlashCommand, PARAM_TYPES } from "../../../../common/models/SlashCommand";
import { sendLogMessage } from "../../utils/ChannelLogging";
import discord from "../../../../common/utils/discord/discord";

export default class BanSlashCommand extends AdminSlashCommand {
  constructor() {
    super("ban", "Ban a user");

    this.data
      .addUserOption((option) => option.setName("user").setDescription("The user to ban").setRequired(true))
      .addStringOption((option) => option.setName("reason").setDescription("The reason for banning.").setRequired(true))
      .addIntegerOption((option) =>
        option
          .setName("deletemessagestime")
          .setDescription("The number of seconds to go back and delete of the banned users messages")
          .setMinValue(0),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const user: User = this.getParamValue(interaction, PARAM_TYPES.USER, "user");
    const reason: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "reason");
    const deleteMessagesSeconds: number = this.getParamValue(interaction, PARAM_TYPES.INTEGER, "deletemessagestime") || 0;

    const member = await discord.members.getMember(user.id);
    if (!member) {
      interaction.editReply({ content: "Error finding member!" });
      Stumper.error(`Error finding member for user ${user.id}`, "userManagement:BanSlashCommand:execute");
      return;
    }

    await member.ban({ deleteMessageSeconds: deleteMessagesSeconds, reason: reason });

    const username = member.displayName || member.user.username;

    Stumper.warning(
      `User ${username} (id: ${member.user.id}) has been banned by ${interaction.user.username}!`,
      "userManagement:BanSlashCommand:execute",
    );
    sendLogMessage(`User \`${username}\` has been banned by \`${interaction.user.username}\`! Reason: \`${reason}\``);

    if (deleteMessagesSeconds > 0) {
      Stumper.warning(`Deleting messages from ${username} for the last ${deleteMessagesSeconds} seconds.`, "userManagement:BanSlashCommand:execute");
      sendLogMessage(`Deleting messages from \`${username}\` for the last \`${deleteMessagesSeconds} seconds.\``);
    }

    interaction.followUp({ content: `User ${username} has been banned!`, ephemeral: false });
  }
}
