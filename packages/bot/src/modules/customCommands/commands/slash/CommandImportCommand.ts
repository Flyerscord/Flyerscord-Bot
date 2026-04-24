import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import CommandImporter from "../../utils/CommandImporter";

export default class CommandImportCommand extends AdminSlashCommand {
  constructor() {
    super("customimport", "Start and stop the command import process", { ephemeral: true });

    this.data
      .addSubcommand((subcmd) =>
        subcmd
          .setName("start")
          .setDescription("Start the command import process")
          .addChannelOption((option) => option.setName("channel").setDescription("The channel to send the commands to").setRequired(true))
          .addUserOption((option) =>
            option.setName("botuser").setDescription("The bot user that will send the response to the command").setRequired(true),
          )
          .addStringOption((option) => option.setName("prefix").setDescription("The prefix for the command").setRequired(true)),
      )
      .addSubcommand((subcmd) => subcmd.setName("stop").setDescription("Stop the command import process"));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (this.isSubCommand(interaction, "start")) {
      const channel = this.getChannelParamValue(interaction, "channel");
      const botUser = this.getUserParamValue(interaction, "botuser");
      const prefix = this.getStringParamValue(interaction, "prefix");

      CommandImporter.getInstance().enable(channel.id, interaction.user.id, botUser.id, prefix);

      await this.replies.reply("Command import process started! Start running commands!");
    } else if (this.isSubCommand(interaction, "stop")) {
      CommandImporter.getInstance().disable();
      await this.replies.reply("Command import process stopped!");
    }
  }
}
