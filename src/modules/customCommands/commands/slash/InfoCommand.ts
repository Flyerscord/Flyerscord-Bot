import { AutocompleteInteraction, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import { AdminAutocompleteSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@root/src/common/managers/ConfigManager";
import CustomCommandsDB from "../../db/CustomCommandsDB";
import { CustomCommand } from "../../db/schema";

export default class InfoCommand extends AdminAutocompleteSlashCommand {
  constructor() {
    super("custominfo", "Returns the info for the specified custom command.", { ephermal: true });

    this.data.addStringOption((option) =>
      option.setName("name").setDescription(`The name of the command to get the info for.`).setRequired(true).setAutocomplete(true),
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const db = new CustomCommandsDB();

    const commandName: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "name");

    const command = await db.getCommand(commandName);

    if (command) {
      const embed = await this.createEmbed(command);
      await this.replies.reply({ embeds: [embed] });
    } else {
      await this.replies.reply(`A custom comamnd with the name ${commandName} does not exist!`);
    }
  }

  async getAutoCompleteOptions(interaction: AutocompleteInteraction): Promise<string[] | undefined> {
    const focusedName = this.getFocusedOptionName(interaction);

    if (focusedName == "name") {
      const db = new CustomCommandsDB();
      return await db.getAllCommandNames();
    }
    return undefined;
  }

  private async createEmbed(command: CustomCommand): Promise<EmbedBuilder> {
    const embed = new EmbedBuilder();
    const member = await discord.members.getMember(command.createdBy);
    const username = member ? member.displayName || member.user.username : command.createdBy;

    const prefix = ConfigManager.getInstance().getConfig("CustomCommands").prefix;

    embed.setTitle(`${prefix}${command.name}`);
    embed.setDescription(`Created by: ${username}`);
    embed.setTimestamp(command.createdOn);
    embed.setColor("Yellow");
    embed.addFields({ name: "Text", value: command.text });

    return embed;
  }
}
