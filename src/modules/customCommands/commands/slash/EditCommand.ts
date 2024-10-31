import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand, PARAM_TYPES } from "../../../../common/models/SlashCommand";
import CustomCommandsDB from "../../providers/CustomCommands.Database";
import Config from "../../../../common/config/Config";
import { InvalidImgurUrlException } from "../../exceptions/InvalidImgurUrlException";
import { ErrorUploadingToImageKitException } from "../../exceptions/ErrorUploadingToImageKitException";
import Stumper from "stumper";
import PageNotFoundException from "../../exceptions/PageNotFoundException";

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
    const db = CustomCommandsDB.getInstance();

    let name: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "name");
    const newResponse: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "newresponse");

    name = name.toLowerCase();

    if (!db.hasCommand(name)) {
      interaction.reply({
        content: `Command ${Config.getConfig().prefix.normal}${name} does not exist!`,
        ephemeral: true,
      });
      return;
    }

    try {
      await db.updateCommand(name, newResponse, interaction.user.id);
    } catch (error) {
      Stumper.caughtError(error, "customCommands:EditCommand:execute");
      if (error instanceof InvalidImgurUrlException || error instanceof ErrorUploadingToImageKitException) {
        interaction.reply({
          content: `Error updating command ${Config.getConfig().prefix.normal}${name}! There was an issue with the url. Contact flyerzrule for help.`,
          ephemeral: true,
        });
        return;
      } else if (error instanceof PageNotFoundException) {
        interaction.reply({
          content: `Error adding command ${Config.getConfig().prefix.normal}${name}! The url returns a 404.`,
          ephemeral: true,
        });
        return;
      } else {
        interaction.reply({
          content: `Error adding command ${Config.getConfig().prefix.normal}${name}!`,
          ephemeral: true,
        });
        throw error;
      }
    }
    interaction.reply({
      content: `Command ${Config.getConfig().prefix.normal}${name} updated!`,
      ephemeral: true,
    });
  }
}
