import { AutocompleteInteraction, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import { AdminAutocompleteSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import CustomCommandsDB from "../../providers/CustomCommands.Database";
import ICustomCommand from "../../interfaces/ICustomCommand";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/config/ConfigManager";

export default class InfoCommand extends AdminAutocompleteSlashCommand {
  constructor() {
    super("custominfo", "Returns the info for the specified custom command.");

    this.data.addStringOption((option) =>
      option.setName("name").setDescription(`The name of the command to get the info for.`).setRequired(true).setAutocomplete(true),
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const replies = await discord.interactions.createReplies(interaction, "customCommands:InfoCommand:execute", true);

    const db = CustomCommandsDB.getInstance();

    const commandName: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "name");

    const command = db.getCommand(commandName);

    if (command) {
      const embed = await this.createEmbed(command);
      await replies.reply({ embeds: [embed] });
    } else {
      await replies.reply(`A custom comamnd with the name ${commandName} does not exist!`);
    }
  }

  async getAutoCompleteOptions(interaction: AutocompleteInteraction): Promise<string[] | undefined> {
    const focusedName = this.getFocusedOptionName(interaction);

    if (focusedName == "name") {
      const db = CustomCommandsDB.getInstance();
      return db.getAllCommandNames();
    }
    return undefined;
  }

  private async createEmbed(command: ICustomCommand): Promise<EmbedBuilder> {
    const embed = new EmbedBuilder();
    const member = await discord.members.getMember(command.createdBy);
    const username = member ? member.displayName || member.user.username : command.createdBy;

    const prefix = ConfigManager.getInstance().getConfig("CustomCommands").prefix;

    embed.setTitle(`${prefix}${command.name}`);
    embed.setDescription(`Created by: ${username}`);
    embed.setTimestamp(command.createdOn);
    embed.setColor("Yellow");
    embed.addFields({ name: "Text", value: command.text });

    let history = command.history;
    const maxItemsToDisplay = 24;
    if (history.length > maxItemsToDisplay) {
      history = history.slice(-maxItemsToDisplay);
      embed.setFooter({ text: `Command history truncated to latest ${maxItemsToDisplay} entries` });
    }

    for (let i = history.length - 1; i >= 0; i--) {
      const historyItem = history[i];

      embed.addFields({
        name: `Edit ${historyItem.index + 1}`,
        value: `**Old**: ${historyItem.oldText}  **New**: ${historyItem.newText}  **Author**: ${username}  **Date**: ${historyItem.editedOn}`,
      });
    }

    return embed;
  }
}
