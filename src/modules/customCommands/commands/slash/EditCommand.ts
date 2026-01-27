import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { AdminAutocompleteSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import { InvalidImgurUrlException } from "../../exceptions/InvalidImgurUrlException";
import { ErrorUploadingToImageKitException } from "../../exceptions/ErrorUploadingToImageKitException";
import Stumper from "stumper";
import PageNotFoundException from "../../exceptions/PageNotFoundException";
import ConfigManager from "@common/managers/ConfigManager";
import CustomCommandsDB from "../../db/CustomCommandsDB";

export default class EditCommand extends AdminAutocompleteSlashCommand {
  constructor() {
    super("customedit", "Update a custom command", { ephemeral: true });

    this.data
      .addStringOption((option) =>
        option.setName("name").setDescription(`The name of the command. Case insensitive`).setRequired(true).setAutocomplete(true),
      )
      .addStringOption((option) =>
        option.setName("newresponse").setDescription("The new response that the command will respond with").setRequired(true),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const prefix = ConfigManager.getInstance().getConfig("CustomCommands").prefix;

    const db = new CustomCommandsDB();

    let name: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "name");
    const newResponse: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "newresponse");

    name = name.toLowerCase();

    if (!(await db.hasCommand(name))) {
      await this.replies.reply(`Command ${prefix}${name} does not exist!`);
      return;
    }

    try {
      await db.updateCommand(name, newResponse, interaction.user.id);
    } catch (error) {
      Stumper.caughtError(error, "customCommands:EditCommand:execute");
      if (error instanceof InvalidImgurUrlException || error instanceof ErrorUploadingToImageKitException) {
        await this.replies.reply(`Error updating command ${prefix}${name}! There was an issue with the url. Contact flyerzrule for help.`);
        return;
      } else if (error instanceof PageNotFoundException) {
        await this.replies.reply(`Error adding command ${prefix}${name}! The url returns a 404.`);
        return;
      } else {
        await this.replies.reply(`Error adding command ${prefix}${name}!`);
        throw error;
      }
    }
    await this.replies.reply(`Command ${prefix}${name} updated!`);
  }

  async getAutoCompleteOptions(interaction: AutocompleteInteraction): Promise<string[] | undefined> {
    const focusedName = this.getFocusedOptionName(interaction);

    if (focusedName == "name") {
      const db = new CustomCommandsDB();
      return await db.getAllCommandNames();
    }
    return undefined;
  }
}
