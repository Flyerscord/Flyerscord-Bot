import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand, PARAM_TYPES } from "../../../../common/models/SlashCommand";
import CustomCommandsDB from "../../providers/CustomCommands.Database";
import Config from "../../../../common/config/Config";

export default class AddCommand extends AdminSlashCommand {
  constructor() {
    super("addcustom", "Add a custom command");

    this.data
      .addSubcommand((subcmd) =>
        subcmd
          .setName("image")
          .setDescription("Command that sends a picture or a gif")
          .addStringOption((option) => option.setName("name").setDescription("The name of the command").setRequired(true))
          .addAttachmentOption((option) => option.setName("image").setDescription("The image or gif to send with the command").setRequired(true)),
      )
      .addSubcommand((subCmd) =>
        subCmd
          .setName("text")
          .setDescription("Command that sends text")
          .addStringOption((option) => option.setName("name").setDescription("The name of the command").setRequired(true))
          .addStringOption((option) =>
            option.setName("text").setDescription("The text that will be sent when calling the command").setRequired(true),
          ),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const db = CustomCommandsDB.getInstance();

    let name: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "name");
    const response: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "response");

    name = name.toLowerCase();

    if (db.hasCommand(name)) {
      interaction.reply({
        content: `Command ${Config.getConfig().prefixes.custom}${name} already exists!`,
        ephemeral: true,
      });
      return;
    }

    db.addCommand(name, response, interaction.user.id);
    interaction.reply({
      content: `Command ${Config.getConfig().prefixes.custom}${name} added!`,
      ephemeral: true,
    });
  }
}
