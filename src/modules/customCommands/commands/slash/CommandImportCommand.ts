import { Channel, ChatInputCommandInteraction, User } from "discord.js";
import { AdminSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import CommandImporter from "../../utils/CommandImporter";
import discord from "@common/utils/discord/discord";

export default class CommandImportCommand extends AdminSlashCommand {
  constructor() {
    super("customimport", "Start and stop the command import process");

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
    const replies = await discord.interactions.createReplies(interaction, "customCommands:CommandImportCommand:execute", true);

    if (this.isSubCommand(interaction, "start")) {
      const channel: Channel = this.getParamValue(interaction, PARAM_TYPES.CHANNEL, "channel");
      const botUser: User = this.getParamValue(interaction, PARAM_TYPES.USER, "botuser");
      const prefix: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "prefix");

      CommandImporter.getInstance().enable(channel.id, interaction.user.id, botUser.id, prefix);

      await replies.reply("Command import process started! Start running commands!");
    } else if (this.isSubCommand(interaction, "stop")) {
      CommandImporter.getInstance().disable();
      await replies.reply("Command import process stopped!");
    }
  }
}
