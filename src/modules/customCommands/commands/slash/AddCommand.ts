import { Attachment, ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand, PARAM_TYPES } from "../../../../common/models/SlashCommand";
import CustomCommandsDB from "../../providers/CustomCommands.Database";
import Config from "../../../../common/config/Config";
import { InvalidImgurUrlException } from "../../exceptions/InvalidImgurUrlException";
import { ErrorUploadingToImageKitException } from "../../exceptions/ErrorUploadingToImageKitException";
import Stumper from "stumper";
import PageNotFoundException from "../../exceptions/PageNotFoundException";
import HTMLPageException from "../../exceptions/HTMLPageException";

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
    await interaction.deferReply({ ephemeral: true });

    const db = CustomCommandsDB.getInstance();

    let name: string = "";
    let text: string = "";
    let isTextOnly: boolean = false;

    if (this.isSubCommand(interaction, "image")) {
      name = (this.getParamValue(interaction, PARAM_TYPES.STRING, "name") as string).toLowerCase();
      text = (this.getParamValue(interaction, PARAM_TYPES.ATTACHMENT, "image") as Attachment).url;
    } else if (this.isSubCommand(interaction, "imagelink")) {
      name = (this.getParamValue(interaction, PARAM_TYPES.STRING, "name") as string).toLowerCase();
      text = this.getParamValue(interaction, PARAM_TYPES.STRING, "link") as string;
    } else if (this.isSubCommand(interaction, "text")) {
      name = (this.getParamValue(interaction, PARAM_TYPES.STRING, "name") as string).toLowerCase();
      text = this.getParamValue(interaction, PARAM_TYPES.STRING, "text");
      isTextOnly = true;
    }

    if (name != "" && text != "") {
      if (db.hasCommand(name) || interaction.client.textCommands.hasAny(name)) {
        interaction.editReply({
          content: `Command ${Config.getConfig().prefix.normal}${name} already exists!`,
        });
        return;
      }

      try {
        if (isTextOnly) {
          await db.addCommandSkippingUpload(name, text, interaction.user.id);
        } else {
          await db.addCommand(name, text, interaction.user.id);
        }
      } catch (error) {
        Stumper.caughtError(error, "customCommands:AddCommand:execute");
        if (error instanceof InvalidImgurUrlException || error instanceof ErrorUploadingToImageKitException) {
          interaction.editReply({
            content: `Error adding command ${Config.getConfig().prefix.normal}${name}! There was an issue with the url. Try downloading the image and uploading it with the image subcommand. Otherwise contact flyerzrule for help.`,
          });
          return;
        } else if (error instanceof PageNotFoundException) {
          interaction.editReply({
            content: `Error adding command ${Config.getConfig().prefix.normal}${name}! The url returns a 404.`,
          });
          return;
        } else if (error instanceof HTMLPageException) {
          interaction.editReply({
            content: `Error adding command ${Config.getConfig().prefix.normal}${name}! The url is a HTML page and not an image. Try downloading the image and uploading it with the image subcommand.`,
          });
          return;
        } else {
          interaction.editReply({
            content: `Error adding command ${Config.getConfig().prefix.normal}${name}!`,
          });
          throw error;
        }
      }
      interaction.editReply({
        content: `Command ${Config.getConfig().prefix.normal}${name} added!`,
      });
    }
  }
}
