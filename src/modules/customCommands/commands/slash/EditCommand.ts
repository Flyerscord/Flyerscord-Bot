import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { AdminAutocompleteSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import CustomCommandsDB from "../../providers/CustomCommands.Database";
import { InvalidImgurUrlException } from "../../exceptions/InvalidImgurUrlException";
import { ErrorUploadingToImageKitException } from "../../exceptions/ErrorUploadingToImageKitException";
import Stumper from "stumper";
import PageNotFoundException from "../../exceptions/PageNotFoundException";
import ConfigManager from "@common/config/ConfigManager";

export default class EditCommand extends AdminAutocompleteSlashCommand {
  constructor() {
    super("customedit", "Update a custom command", { ephermal: true });

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

    const db = CustomCommandsDB.getInstance();

    let name: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "name");
    const newResponse: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "newresponse");

    name = name.toLowerCase();

    if (!db.hasCommand(name)) {
      this.replies.reply(`Command ${prefix}${name} does not exist!`);
      return;
    }

    try {
      await db.updateCommand(name, newResponse, interaction.user.id);
    } catch (error) {
      Stumper.caughtError(error, "customCommands:EditCommand:execute");
      if (error instanceof InvalidImgurUrlException || error instanceof ErrorUploadingToImageKitException) {
        this.replies.reply(`Error updating command ${prefix}${name}! There was an issue with the url. Contact flyerzrule for help.`);
        return;
      } else if (error instanceof PageNotFoundException) {
        this.replies.reply(`Error adding command ${prefix}${name}! The url returns a 404.`);
        return;
      } else {
        this.replies.reply(`Error adding command ${prefix}${name}!`);
        throw error;
      }
    }
    this.replies.reply(`Command ${prefix}${name} updated!`);
  }

  async getAutoCompleteOptions(interaction: AutocompleteInteraction): Promise<string[] | undefined> {
    const focusedName = this.getFocusedOptionName(interaction);

    if (focusedName == "name") {
      const db = CustomCommandsDB.getInstance();
      return db.getAllCommandNames();
    }
    return undefined;
  }
}
