import { Interaction, Client } from "discord.js";

import Logger from "Stumper";

export default (client: Client): void => {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;
    try {
      Logger.info(`Running command: ${interaction.commandName}`, "interactionCreate");
      await command.execute(interaction);
    } catch (error) {
      if (error) Logger.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  });
};
