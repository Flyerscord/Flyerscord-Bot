import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import { AdminSlashCommand, PARAM_TYPES } from "../../../../common/models/SlashCommand.js";
import CustomCommandsDB from "../../providers/CustomCommands.Database.js";
import ICustomCommand from "../../interfaces/ICustomCommand.js";

export default class InfoCommand extends AdminSlashCommand {
  constructor() {
    super("custominfo", "Returns the info for the specified custom command.");

    this.data.addStringOption((option) => option.setName("name").setDescription(`The name of the command to get the info for.`).setRequired(true));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const db = CustomCommandsDB.getInstance();

    const commandName: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "name");

    const command = db.getCommand(commandName);

    if (command) {
      const embed = createEmbed(command);
      interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      interaction.reply({
        content: `A custom comamnd with the name ${commandName} does not exist!`,
        ephemeral: true,
      });
    }
  }
}

function createEmbed(command: ICustomCommand): EmbedBuilder {
  const embed = new EmbedBuilder();

  embed.setTitle(`Name: ${command.name}`);
  embed.setAuthor({ name: command.createdBy });
  embed.setTimestamp(command.createdOn);
  embed.setColor("Yellow");
  embed.addFields({ name: "Text", value: command.text });

  const history = command.history;

  for (let i = history.length - 1; i >= 0; i--) {
    const historyItem = history[i];

    embed.addFields({
      name: `Edit ${i + 1}`,
      value: `Old: ${historyItem.oldText}  New: ${historyItem.newText}  Author: ${historyItem.editedBy}  Date: ${historyItem.editedOn}`,
    });
  }

  return embed;
}
