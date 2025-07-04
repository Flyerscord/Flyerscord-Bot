import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import CustomCommandsDB from "../../providers/CustomCommands.Database";
import { InvalidImgurUrlException } from "../../exceptions/InvalidImgurUrlException";
import { ErrorUploadingToImageKitException } from "../../exceptions/ErrorUploadingToImageKitException";
import Stumper from "stumper";
import PageNotFoundException from "../../exceptions/PageNotFoundException";
import ConfigManager from "@common/config/ConfigManager";

export default class EditCommand extends AdminSlashCommand {
  constructor() {
    super("customedit", "Update a custom command");

    this.data
      .addStringOption((option) =>
        option.setName("name").setDescription(`The name of the command. Case insensitive`).setRequired(true).setAutocomplete(true),
      )
      .addStringOption((option) =>
        option.setName("newresponse").setDescription("The new response that the command will respond with").setRequired(true),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const prefix = ConfigManager.getInstance().getConfig("CustomCommands").prefix;

    const db = CustomCommandsDB.getInstance();

    let name: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "name");
    const newResponse: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "newresponse");

    name = name.toLowerCase();

    if (!db.hasCommand(name)) {
      interaction.editReply({
        content: `Command ${prefix}${name} does not exist!`,
      });
      return;
    }

    try {
      await db.updateCommand(name, newResponse, interaction.user.id);
    } catch (error) {
      Stumper.caughtError(error, "customCommands:EditCommand:execute");
      if (error instanceof InvalidImgurUrlException || error instanceof ErrorUploadingToImageKitException) {
        interaction.editReply({
          content: `Error updating command ${prefix}${name}! There was an issue with the url. Contact flyerzrule for help.`,
        });
        return;
      } else if (error instanceof PageNotFoundException) {
        interaction.editReply({
          content: `Error adding command ${prefix}${name}! The url returns a 404.`,
        });
        return;
      } else {
        interaction.editReply({
          content: `Error adding command ${prefix}${name}!`,
        });
        throw error;
      }
    }
    interaction.editReply({
      content: `Command ${prefix}${name} updated!`,
    });
  }
}
