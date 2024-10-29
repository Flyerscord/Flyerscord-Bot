import { Attachment, ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand, PARAM_TYPES } from "../../../../common/models/SlashCommand";
import CustomCommandsDB from "../../providers/CustomCommands.Database";
import Config from "../../../../common/config/Config";

export default class AddCommand extends AdminSlashCommand {
  constructor() {
    super("customadd", "Add a custom command");

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
          .setName("imagelink")
          .setDescription("Command that sends a image link (Most Common)")
          .addStringOption((option) => option.setName("name").setDescription("The name of the command").setRequired(true))
          .addStringOption((option) => option.setName("link").setDescription("The link to the image").setRequired(true)),
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

    let name: string = "";
    let text: string = "";

    if (this.isSubCommand(interaction, "image")) {
      name = (this.getParamValue(interaction, PARAM_TYPES.STRING, "name") as string).toLowerCase();
      text = (this.getParamValue(interaction, PARAM_TYPES.ATTACHMENT, "image") as Attachment).url;
    } else if (this.isSubCommand(interaction, "imagelink")) {
      name = (this.getParamValue(interaction, PARAM_TYPES.STRING, "name") as string).toLowerCase();
      text = this.getParamValue(interaction, PARAM_TYPES.STRING, "link") as string;
    } else if (this.isSubCommand(interaction, "text")) {
      name = (this.getParamValue(interaction, PARAM_TYPES.STRING, "name") as string).toLowerCase();
      text = this.getParamValue(interaction, PARAM_TYPES.STRING, "text");
    }

    if (name != "" && text != "") {
      if (db.hasCommand(name) || interaction.client.textCommands.hasAny(name)) {
        interaction.reply({
          content: `Command ${Config.getConfig().prefix}${name} already exists!`,
          ephemeral: true,
        });
        return;
      }

      db.addCommand(name, text, interaction.user.id);
      interaction.reply({
        content: `Command ${Config.getConfig().prefix}${name} added!`,
        ephemeral: true,
      });
    }
  }
}
